import { useState } from 'react'
import { ThemeProvider, CssBaseline, Container, Box, Typography, Button, Paper, Select, MenuItem, FormControl, InputLabel, CircularProgress, useMediaQuery } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Editor, { loader } from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import type { ReviewResponse } from './types'
import type { SelectChangeEvent } from '@mui/material/Select'
import { reviewCode } from './api'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const languagePatterns = {
  java: {
    patterns: [
      /\bclass\s+\w+\s*\{/,
      /\bpublic\s+(?:class|interface|enum)\s+\w+/,
      /\bimport\s+java\./,
      /\bpackage\s+[\w.]+;/
    ]
  },
  typescript: {
    patterns: [
      /:\s*(?:string|number|boolean|any)\b/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=/,
      /import\s+{\s*[\w\s,]+}\s+from/
    ]
  },
  javascript: {
    patterns: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /function\s*\w*\s*\(/,
      /=>\s*{/,
      /\bmodule\.exports\b/
    ]
  },
  python: {
    patterns: [
      /def\s+\w+\s*\(/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /class\s+\w+(?:\s*\([^)]*\))?\s*:/
    ]
  },
  cpp: {
    patterns: [
      /#include\s*[<"]/,
      /\bstd::/,
      /\busing\s+namespace\s+std\b/,
      /\bint\s+main\s*\(\s*(?:void|int\s+argc|char\s*\*\s*argv)\s*\)/
    ]
  },
  csharp: {
    patterns: [
      /using\s+System;/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /\bstring\[\]\s+args/
    ]
  },
  php: {
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /function\s+\w+\s*\(/,
      /namespace\s+\w+;/
    ]
  },
  ruby: {
    patterns: [
      /def\s+\w+/,
      /require\s+['"][^'"]+['"]/,
      /class\s+\w+\s*<?\s*\w*/,
      /\bmodule\s+\w+/
    ]
  },
  go: {
    patterns: [
      /package\s+main/,
      /import\s+\(/,
      /func\s+\w+\s*\(/,
      /type\s+\w+\s+struct/
    ]
  },
  rust: {
    patterns: [
      /fn\s+\w+/,
      /let\s+mut\s+\w+/,
      /use\s+std::/,
      /impl\s+\w+/
    ]
  }
} as const;

type SupportedLanguage = keyof typeof languagePatterns;

const languages: SupportedLanguage[] = Object.keys(languagePatterns) as SupportedLanguage[];

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<SupportedLanguage>('javascript')
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  
  const isMobile = useMediaQuery('(max-width:600px)')
  const isTablet = useMediaQuery('(max-width:960px)')

  const handleEditorDidMount = async () => {
    // Pre-load language detection worker
    const monaco = await loader.init()
    await monaco.languages.register({ id: 'detect-lang' })
  }

  const detectLanguage = (code: string) => {
    if (!code.trim()) return;

    // Score each language based on how many patterns match
    const scores = Object.entries(languagePatterns).map(([lang, { patterns }]) => {
      const score = patterns.reduce((count, pattern) => 
        count + (pattern.test(code) ? 1 : 0), 0
      );
      return { lang, score };
    });

    // Find the language with the highest score
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    // Only update if we have at least one match
    if (bestMatch.score > 0) {
      setLanguage(bestMatch.lang as SupportedLanguage);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    detectLanguage(newCode)
  }

  const handleReview = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    try {
      const response = await reviewCode(code, language)
      setReview(response)
    } catch (error) {
      console.error('Error reviewing code:', error)
      alert('Error reviewing code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ 
          my: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2
          }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              gutterBottom={false}
            >
              AI Code Reviewer
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                opacity: 0.7,
                textAlign: { xs: 'left', sm: 'right' }
              }}
            >
              Powered by Deepseek AI
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e: SelectChangeEvent) => setLanguage(e.target.value as SupportedLanguage)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Paper elevation={3} sx={{ mb: 3 }}>
            <Editor
              height={isMobile ? "300px" : "400px"}
              language={language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: !isMobile && !isTablet },
                fontSize: isMobile ? 12 : 14,
                wordWrap: 'on'
              }}
            />
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReview}
              disabled={loading || !code.trim()}
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Review Code'}
            </Button>
          </Box>

          {review && (
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
              <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                Code Review Results
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
                  Review Analysis
                </Typography>
                <Box sx={{ 
                  '& .section': { 
                    mb: 2,
                    '&:last-child': {
                      mb: 0
                    }
                  },
                  '& .section-title': {
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 1
                  },
                  '& ul': { 
                    listStyle: 'none',
                    p: 0,
                    m: 0
                  },
                  '& li': {
                    display: 'flex',
                    alignItems: 'flex-start',
                    mb: 0.5,
                    '&:last-child': {
                      mb: 0
                    },
                    '&:before': {
                      content: '"•"',
                      color: 'primary.main',
                      display: 'inline-block',
                      width: '1em',
                      mr: 1
                    }
                  },
                  whiteSpace: 'pre-wrap',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  p: 2
                }}>
                  {Object.entries(review.review).map(([section, points]) => (
                    points.length > 0 && (
                      <div key={section} className="section">
                        <div className="section-title">
                          {section.replace(/([A-Z])/g, ' $1').trim()}:
                        </div>
                        <ul>
                          {points.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Refactored Code
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderColor: 'primary.main'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      size={isMobile ? "small" : "medium"}
                      onClick={() => navigator.clipboard.writeText(review.refactoredCode)}
                      startIcon={<ContentCopyIcon />}
                    >
                      Copy Code
                    </Button>
                  </Box>
                  <Editor
                    height={isMobile ? "250px" : "300px"}
                    language={language}
                    value={review.refactoredCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: !isMobile && !isTablet },
                      fontSize: isMobile ? 12 : 14,
                      wordWrap: 'on'
                    }}
                  />
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
