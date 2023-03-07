import os
import torch
import numpy as np

import spacy
from spacy.tokens import Span
from spacy.attrs import ENT_IOB, ENT_TYPE
from spacy import displacy

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import pipeline


if torch.cuda.is_available():
    device = 'cuda'
elif torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'
print(f"inference.py -> DEVICE : {device}")



summarizer = pipeline(
    "summarization",
    "pszemraj/long-t5-tglobal-base-16384-book-summary",
    device=0 if torch.cuda.is_available() else -1,
)
long_text = "Here is a lot of text I don't want to read. Replace me"



# [ Practice ]
# result = summarizer(long_text)
# print(result[0]["summary_text"])



tokenizer = AutoTokenizer.from_pretrained("allenai/tk-instruct-base-def-pos")
model = AutoModelForSeq2SeqLM.from_pretrained("allenai/tk-instruct-base-def-pos")
# k = pipeline("text2text-generation", model="allenai/tk-instruct-3b-def")



# [ Practice ]
# input_ids = tokenizer.encode("Definition: return the currency of the given country. Now complete the following example - Input: India. Output:", 
#         return_tensors="pt")
# output = model.generate(input_ids, max_length=10)
# output = tokenizer.decode(output[0], skip_special_tokens=True)   # model should output 'Indian Rupee'
# print(output)

# input_ids = tokenizer.encode("Definition: negate the following sentence. Input: John went to school. Output:", 
#         return_tensors="pt")
# output = model.generate(input_ids, max_length=10)
# output = tokenizer.decode(output[0], skip_special_tokens=True)   # model should output 'John did not go to shool.'
# print(output)



# text = "Alphabet's results also missed forecasts on revenue and earnings per share, as advertising declined year-over-year. The numbers come after the company laid off about 12,000 employees in January, a move CEO Sundar Pichai blamed on Alphabet overhiring during the pandemic boom. \
# Q: Why did Alphabet's stock go down?"
# input_ids = tokenizer.encode(text, return_tensors="pt")
# output = model.generate(input_ids, max_length=10)
# output = tokenizer.decode(output[0], skip_special_tokens=True)   # model should output 'John did not go to shool.'
# print(output)



def Tk_instruct(text, questions):
    # Summary 했는지 안했는지
    summarized = False
    summarized_data = ""

    text = text + "\n\nQ: " + questions
    print("Model's input : ", text)


    if len(text) >= 512:
        print(f"===================== Apply Summarization : length = {len(text)} =====================")
        text = summarizer(text)[0]["summary_text"]
        print(f"===================== Summary text : {text} =====================")
        summarized = True
        summarized_data = text



    input_ids = tokenizer.encode(text, return_tensors="pt")
    output = model.generate(input_ids, max_length=10)
    output = tokenizer.decode(output[0], skip_special_tokens=True)


    if summarized:
        output = "Summary News : " + summarized_data + "\n\n" + "Answer : " + output


    return output




































# NER 연습
def practice1():
    print(f"======================={ 1. }=======================")
    nlp = spacy.load("en_core_web_sm")
    doc = nlp("Apple is looking at buying U.K. startup for $1 billion")

    print(doc)
    print(doc.ents)

    for ent in doc.ents:
        print(ent.text, ent.start_char, ent.end_char, ent.label_)


    title = "2. Accessing entity annotations and labels"
    print(f"======================={ title }=======================")
    nlp = spacy.load("en_core_web_sm")
    doc = nlp("San Francisco considers banning sidewalk delivery robots")
    
    # document level
    ents = [(e.text, e.start_char, e.end_char, e.label_) for e in doc.ents]
    print(ents)

    # I - Token is inside an entity.
    # O - Token is outside an entity.
    # B - Token is the beginning of an entity.

    # token level
    ent_san = [doc[0].text, doc[0].ent_iob_, doc[0].ent_type_]
    ent_francisco = [doc[1].text, doc[1].ent_iob_, doc[1].ent_type_]
    print(ent_san)
    print(ent_francisco)



    title = "3. Setting entity annotations"
    print(f"======================={ title }=======================")
    nlp = spacy.load("en_core_web_sm")
    doc = nlp("fb is hiring a new vice president of global policy")
    ents = [(e.text, e.start_char, e.end_char, e.label_) for e in doc.ents]
    print('Before', ents)
    # The model didn't recognize "fb" as an entity :(

    # Create a span for the new entity
    fb_ent = Span(doc, 0, 1, label="ORG"); print(fb_ent)
    orig_ents = list(doc.ents)

    # Option 1: Modify the provided entity spans, leaving the rest unmodified
    doc.set_ents([fb_ent], default="unmodified")

    # Option 2: Assign a complete list of ents to doc.ents
    doc.ents = orig_ents + [fb_ent]

    ents = [(e.text, e.start, e.end, e.label_) for e in doc.ents]
    print('After', ents)
    # [('fb', 0, 1, 'ORG')]



    title = "4. Setting entity annotations from array"
    print(f"======================={ title }=======================")
    nlp = spacy.load("en_core_web_sm")
    doc = nlp.make_doc("London is a big city in the United Kingdom.")
    print("Before", doc.ents) # []

    header = [ENT_IOB, ENT_TYPE]; print(header)
    attr_array = np.zeros((len(doc), len(header)), dtype="uint64"); print(attr_array)
    attr_array[0, 0] = 3 # B
    attr_array[0, 1] = doc.vocab.strings["GPE"]
    doc.from_array(header, attr_array); print(attr_array)
    print("After", doc.ents) # [London]



    title = "5. Visualizing named entities"
    print(f"======================={ title }=======================")
    text = "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously."

    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    # displacy.serve(doc, style="ent")
    displacy.serve(doc, port=3, style="ent")













############################################################################

# news_analysis.html + ner.html => news.html 만드는 연습


from flask import Flask, jsonify, request, render_template
from bs4 import BeautifulSoup
app = Flask(__name__)

@app.route('/')
def practice2():
    title = "1. Rendering HTML"
    print(f"======================={ title }=======================")
    nlp = spacy.load("en_core_web_sm")
    doc1 = nlp("This is a sentence.")
    doc2 = nlp("This is another sentence.")
    ner_html = displacy.render([doc1, doc2], style="dep", page=True)
    
    print("ner_html : ", ner_html)
    
    
    # NER html code
    soup = BeautifulSoup(ner_html, 'html.parser')
    ner_figure_list = soup.select('figure')
    ner_html = ""
    for i in range(len(ner_figure_list)):
        ner_html = ner_html + str(ner_figure_list[i])



    f = open("./templates/news_analysis.html", 'r')
    f2 = open("./modules/templates/example.html", 'w')# read and write

    html = f.read()
    idx = html.find("ner-box") + 9 # NER html 삽입되는 부분

    html = html[:idx] + ner_html + html[idx:]

    f2.seek(0) # open하면 
    f2.write(html)
    # f2.seek(0)
    # print(f2.read())
    
    # from IPython import embed; embed()

    # f2.write(f.read())
    # f2.seek(0) # 가장 앞으로

    return render_template("example.html")




    



if __name__ == "__main__":
    # app.run(host='0.0.0.0', port='777')
    
    practice1()