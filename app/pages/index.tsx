// pages/index.tsx
'use client';
import './styles.css';
import { useState } from 'react';
import axios from 'axios';

export type ApiResponse = {
    title: string;
    sentiment_score: number;
    named_entities: { text: string; type: string }[];
    topics: { text: string; score: number }[];
    keywords: string[];
  };
interface NamedEntity {
  text: string;
  type: string;
}

interface Topic {
  text: string;
  score: number;
}

interface ResponseData {
  title: string;
  sentiment_score: number;
  named_entities: NamedEntity[];
  topics: Topic[];
  keywords: string[];
}

interface APIResponse {
  data: ResponseData;
  // include other properties received in the response object if needed
}

interface IndexProps {
    setResponses: React.Dispatch<React.SetStateAction<ApiResponse[]>>;
  }

const Home: React.FC<IndexProps> = ({ setResponses }) => {
  const [inputText, setInputText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [localResponses, setLocalResponses] = useState<ApiResponse[]>([]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = `Given the following text, please perform the following analyses and return the results in JSON format:
      Generate a title for the text.
      Analyze the sentiment of the text and return the sentiment score on a scale of -1 to 1.
      Identify the named entities present in the text and return their corresponding entity types (e.g. person, organization, location).
      Identify the topics present in the text and return the top 5 most relevant topics and their corresponding scores.
      Generate a list of keywords or tags that represent the main concepts or themes of the text.
      
      Text: ${inputText}

      {
        "title": "",
        "sentiment_score": 0.0,
        "named_entities": [
          {
            "text": "",
            "type": ""
          }
        ],
        "topics": [
          {
            "text": "",
            "score": 0.0
          }
        ],
        "keywords": [
          ""
        ]
      }`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      }, {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json',
        },
      });

      if (response.data && typeof response.data === 'object') {
        const choices = response.data.choices;
        if (choices && choices.length > 0) {
          const content = choices[0].message.content;
          if (content) {
            try {
                const parsedContent: ApiResponse = JSON.parse(content);
                console.log('Parsed Content:', parsedContent); // Log the parsed content
              setLocalResponses(prevResponses => [...prevResponses, parsedContent]);
              setResponses(prevResponses => [...prevResponses, parsedContent]);
              setShowResults(true);
            } catch (error) {
              console.error('Error parsing content to JSON:', error);
            }
          } else {
            console.error('Content is missing in the response:', response.data);
          }
        } else {
          console.error('Choices are missing or empty in the response:', response.data);
        }
      }
      
    } catch (error) {
      console.error('Error making the API call', error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Visualisation Prototype</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="inputText" className="label">Paste Text Here:</label>
        <textarea 
          id="inputText" 
          className="textarea" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="button">Analyze Text</button>
      </form>
      {showResults && (
        <div>
          <button onClick={() => setShowResults(!showResults)} className="button data-preview-button">
            {showResults ? 'Hide Results' : 'Show Results'}
          </button>
          <div className="results">
            {localResponses.map((response: ApiResponse, index: number) => (
              <pre key={index}>{JSON.stringify(response, null, 2)}</pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
