---
title: Stock News Summaries AI
emoji: 👁
colorFrom: blue
colorTo: red
sdk: gradio
sdk_version: 3.17.0
app_file: app.py
pinned: false
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference



# Stock News Analysis

This project uses Natural Language Processing (NLP) techniques and machine learning models to analyze stock news, extract valuable insights, and provide visualizations to help users make informed investment decisions.

## Features
1. Named Entity Recognition (NER) - This feature identifies and extracts important entities such as company names, people, and locations from news articles to help users stay up-to-date with the latest news related to their investments.
2. Tk-instruct Model - This feature allows users to ask questions about the stock market and receive answers in a conversational format. The Tk-instruct model uses machine learning algorithms to understand natural language queries and provides relevant information to the user.
3. Stock Chart Visualization - This feature provides users with an interactive chart that visualizes the historical performance of a stock. Users can customize the time frame and chart settings to view the information that is most relevant to them.
4. News Crawler - This feature enables users to keep track of the latest news related to their investments. The news crawler regularly scans news websites and automatically extracts articles that mention specific companies or industries.


## Installation
1. Clone the repository
    ```console
    git clone https://github.com/mdj1412/Stock_News_Analysis.git
    ```
2. Install the required packages
    ```console
    pip install -r requirements.txt
    ```
3. Run the application
    ```console
    python app.py
    ```


## Dependency
* pandas
* beautifulsoup4
* Flask
* torch
* transformers
* accelerate
* bitsandbytes
* spacy
* yfinance


## Demo
* You can check a little faster through the demo [here](https://huggingface.co/spaces/mdj1412/stock_news_summaries_AI).


## License
This project is licensed under the MIT [License]() file for details.


