export interface CodeReview {
  codeStructure: string[];
  namingConventions: string[];
  codeQuality: string[];
  performance: string[];
  bestPractices: string[];
}

export interface ReviewResponse {
  review: CodeReview;
  refactoredCode: string;
}

export interface DeepseekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
} 