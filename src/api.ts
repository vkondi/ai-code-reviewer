import axios from 'axios';
import type { DeepseekResponse, ReviewResponse } from './types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

const generatePrompt = (code: string, language: string) => {
  return `You are an expert code reviewer. Please review the following ${language} code and provide a detailed analysis.

The code is:

\`\`\`${language}
${code}
\`\`\`

Please provide your response in the following JSON format:

{
  "review": {
    "codeStructure": [
      // Array of points about code structure and organization
      // e.g., "Well-structured with clear interface definitions",
      // "Good separation of concerns",
      // "Consider adding JSDoc comments"
    ],
    "namingConventions": [
      // Array of points about naming conventions
      // e.g., "Consistent PascalCase for interfaces",
      // "Clear and descriptive variable names"
    ],
    "codeQuality": [
      // Array of points about code quality
      // e.g., "Proper error handling",
      // "Good type safety implementation"
    ],
    "performance": [
      // Array of points about performance
      // e.g., "Efficient data structures used",
      // "Consider caching results"
    ],
    "bestPractices": [
      // Array of points about best practices
      // e.g., "Follows ${language} conventions",
      // "Good use of design patterns"
    ]
  },
  "refactoredCode": "// Your refactored version of the code implementing the suggested improvements"
}

Ensure each point in the arrays is specific, actionable, and complete. The refactored code should be a string containing the complete improved version of the code.`;
};

const parseResponse = (response: string): ReviewResponse => {
  try {
    // Find the JSON block in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    // Parse the JSON
    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!parsedResponse.review || !parsedResponse.refactoredCode) {
      throw new Error('Invalid response structure');
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error parsing review response:', error);
    // Fallback response
    return {
      review: {
        codeStructure: ['Error parsing review response'],
        namingConventions: [],
        codeQuality: [],
        performance: [],
        bestPractices: []
      },
      refactoredCode: 'Error parsing refactored code'
    };
  }
};

export const reviewCode = async (code: string, language: string): Promise<ReviewResponse> => {
  try {
    const response = await axios.post<DeepseekResponse>(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: generatePrompt(code, language),
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || '';
    return parseResponse(aiResponse);
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    throw new Error('Failed to review code');
  }
}; 