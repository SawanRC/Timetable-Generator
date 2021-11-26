from datetime import datetime
from bs4 import BeautifulSoup
import tabula
import requests
import pandas as pd
import json
import re
import argparse
import os


parser = argparse.ArgumentParser()
parser.add_argument('--out_file', type=str, default='assets/dates.json',
                    help='file location to output dates to (default: assets/dates.json)')

args = parser.parse_args()

webpage_response = requests.get('https://www.wgtn.ac.nz/students/study/dates')

webpage = webpage_response.content
soup = BeautifulSoup(webpage, "html.parser")


# Get the three most recent calendars
# PDFs elements have IDs in format d<index>, starting from 1 (where 1 is the newest PDF uploaded)
pdf_elements = soup.find_all(id=re.compile('^d[1-3]$'))

# Extract the href tag, containing the link for each PDF
pdf_links = list(map(lambda elm: elm.get('href'), pdf_elements))


def parse_dates(pdf_link):
	# Parses key dates file from given PDF file, and returns date ranges for each trimester.

    table = tabula.read_pdf(pdf_link, pages=1)[0]
    year = int(re.findall(r'20\d{2}', pdf_link.split('/')[-1])[0])

    start_dates = table[table['Activity'].str.contains("^T[1-3] Week 1$").fillna(False)].sort_values('Activity')['Starting']
    end_dates = table[table['Activity'].str.contains("^T[1-3] Week 12$").fillna(False)].sort_values('Activity')['Starting']

    start_dates = start_dates.apply(lambda x: datetime.strptime(x, '%d-%b'))
    end_dates = end_dates.apply(lambda x: datetime.strptime(x, '%d-%b'))

    start_dict = {}

    for i, date in enumerate(start_dates, 1):
        start_date = date.replace(year=year).strftime('%m/%d/%y')

        # Trimester three wraps around to the next year, so need to increment year by one for it
        end_date = end_dates.iloc[i-1].replace(year=year if i < 3 else year+1).strftime('%m/%d/%y')

        start_dict[i] = {
            "start": start_date,
            "end": end_date
        }

    return {year: start_dict}


def get_all_dates(pdf_links):
	# Utility function which takes a list of PDF files and returns the trimester dates for each file (one file for each year)
	
    all_dates = {}

    for link in pdf_links:
        parsed = parse_dates(link)
        all_dates.update(parsed)

    return all_dates


out_dir = os.path.dirname(args.out_file)

# If the directory for the output file does not exist, create it
if not os.path.exists(out_dir):
    os.makedirs(out_dir, exist_ok=True)

with open(args.out_file, "w+") as f:
    # To read from the JS file requires it to be stored as a JS variable
    # As local files cannot be directly read in Javascript code (due to security policy in browsers)
    f.write("var dates = ")
    f.write(json.dumps(get_all_dates(pdf_links)))
    f.write(";")
    f.truncate()
