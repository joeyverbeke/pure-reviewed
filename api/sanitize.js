import OpenAI from 'openai';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

class GrantSanitizer {
  constructor() {
    this.levelPrompts = {
      1: "Minimal processing - only replace obviously problematic terms",
      2: "Light processing - replace inflammatory or highly charged language", 
      3: "Moderate processing - use neutral, academic language throughout",
      4: "Strong processing - ensure all language is objective and measured",
      5: "Maximum processing - make language as neutral and conservative as possible"
    };
  }

  getSystemPrompt(context, ambiguity, noise) {
    return `You are an expert writing consultant specializing in strategic content modification for sensitive contexts.

CONTEXT: ${context}

AMBIGUITY LEVEL: ${ambiguity}/10 - Make potentially sensitive language more ambiguous based on the context
NOISE LEVEL: ${noise}/10 - Insert strategic "noise" content that appears aligned with potential censorship concerns while masking the original signal

Your task is to:
1. ANALYZE the context to understand what kind of censorship or rejection the writing might face
2. APPLY AMBIGUITY: Make sensitive language more vague/indirect proportional to the ambiguity level
3. INSERT NOISE: Add content that appears to align with potential censorship expectations while masking the core message
4. PRESERVE the original meaning and intent while making it less likely to be flagged or rejected 

CRITICAL REQUIREMENTS:
1. WORD COUNT: Maintain the output length as close as possible to the original text length. Academic writing has strict word limits.
2. AMBIGUITY=0 RULE: If ambiguity level is 0, make ABSOLUTELY NO CHANGES to the original language - preserve every word exactly as written.
3. NOISE STRATEGY: Use replacement/expansion rather than pure addition to maintain word count.

AMBIGUITY STRATEGY:
- Level 0: MAKE NO CHANGES TO ORIGINAL TEXT WHATSOEVER - DO NOT MODIFY ANY WORDS OR PHRASES
- Level 1-3: Minimal changes, slight rewording of most sensitive terms
- Level 4-7: Moderate ambiguity, replace direct language with euphemisms/abstractions
- Level 8-10: High ambiguity, use very indirect language and coded messaging

NOISE INSERTION STRATEGY (Word-Count Conscious):
- Level 0-3: Replace some phrases with slightly longer "aligned" versions (same sentence count)
- Level 4-7: Replace sentences with noise-heavy equivalents of similar length
- Level 8-10: Strategic replacement of key phrases with conforming language

CONTEXT-SPECIFIC CONSIDERATIONS:
- For academic/grant contexts: Focus on "institutional priorities," "evidence-based approaches," "collaborative frameworks"
- For authoritarian contexts: Emphasize "stability," "harmony," "development," "cooperation"
- For corporate contexts: Highlight "efficiency," "growth," "innovation," "stakeholder value"

The goal is to make the content strategically ambiguous and masked while preserving the author's core message and intent.`;
  }

  getUserPrompt(context, text, ambiguity, noise) {
    const originalWordCount = text.split(/\s+/).length;
    
    return `Please analyze and strategically modify the following text:

CONTEXT: ${context}
AMBIGUITY LEVEL: ${ambiguity}/10
NOISE LEVEL: ${noise}/10
ORIGINAL WORD COUNT: ${originalWordCount} words

CRITICAL INSTRUCTIONS:
- If AMBIGUITY is 0, make ZERO changes to the original text - preserve it exactly as written
- Maintain word count as close as possible to the original (±10% maximum)
- Use replacement/expansion for noise, not pure addition

ORIGINAL TEXT:
${text}

Please provide:
1. A summary of modifications applied (context analysis, ambiguity changes, noise additions, word count impact)
2. The strategically modified text

Format your response as:
SUMMARY:
[Your modification summary here]

MODIFIED TEXT:
[The strategically modified text here]`;
  }

  async processText(context, text, ambiguity, noise) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.fallbackProcessing(context, text, ambiguity, noise);
      }
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.getSystemPrompt(context, ambiguity, noise) },
          { role: "user", content: this.getUserPrompt(context, text, ambiguity, noise) }
        ],
        max_tokens: 3000,
        temperature: 0.4
      });
      const content = response.choices[0].message.content;
      return this.parseResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.fallbackProcessing(context, text, ambiguity, noise);
    }
  }

  parseResponse(content) {
    // Split the response into summary and modified text
    const parts = content.split("MODIFIED TEXT:");
    
    if (parts.length === 2) {
      const summary = parts[0].replace("SUMMARY:", "").trim();
      const modified_text = parts[1].trim();
      return {
        summary: summary,
        processed_text: modified_text
      };
    } else {
      // Fallback parsing
      return {
        summary: "AI processing completed successfully",
        processed_text: content
      };
    }
  }

  fallbackProcessing(context, text, ambiguity, noise) {
    const processed_text = this.simpleContextProcessing(context, text, ambiguity, noise);
    
    const originalWordCount = text.split(/\s+/).length;
    const processedWordCount = processed_text.split(/\s+/).length;
    const wordCountChange = processedWordCount - originalWordCount;
    const wordCountChangePercent = ((wordCountChange / originalWordCount) * 100).toFixed(1);
    
    const ambiguityDesc = ambiguity === 0 ? "no changes made (ambiguity=0 preserves original text exactly)" : 
                         ambiguity <= 3 ? "light ambiguity adjustments" :
                         ambiguity <= 7 ? "moderate ambiguity in sensitive areas" :
                         "high ambiguity for potentially flagged content";
                         
    const noiseDesc = noise === 0 ? "no noise insertion" :
                     noise <= 3 ? "minimal strategic noise via phrase expansion" :
                     noise <= 7 ? "moderate signal masking through strategic replacements" :
                     "heavy noise via comprehensive phrase expansion and qualifying language";

    const summary = `**Fallback Processing Applied**

**Context Analysis:** Based on "${context}", applied targeted modifications.

**Ambiguity Level (${ambiguity}/10):** ${ambiguityDesc}

**Noise Level (${noise}/10):** ${noiseDesc}

**Word Count Impact:** ${originalWordCount} → ${processedWordCount} words (${wordCountChange >= 0 ? '+' : ''}${wordCountChange}, ${wordCountChangePercent}%)

Note: This is rule-based processing. For full AI-powered analysis, please configure the OpenAI API key.`;

    return {
      summary,
      processed_text
    };
  }

  simpleContextProcessing(context, text, ambiguity, noise) {
    let processed = text;
    const contextLower = context.toLowerCase();
    
    // Apply ambiguity transformations ONLY if ambiguity > 0
    if (ambiguity > 0) {
      const transformations = [];
      
      // General transformations
      const generalTransforms = [
        ['feminist', ambiguity > 5 ? 'gender-focused' : 'feminist'],
        ['socialism', ambiguity > 5 ? 'alternative economic approaches' : 'socialism'],
        ['racism', ambiguity > 5 ? 'social disparities' : 'racism'],
        ['oppression', ambiguity > 5 ? 'structural limitations' : 'oppression'],
        ['liberation', ambiguity > 7 ? 'empowerment' : 'liberation'],
        ['revolution', ambiguity > 3 ? 'transformation' : 'revolution'],
        ['radical', ambiguity > 5 ? 'alternative' : 'radical'],
        ['systemic', ambiguity > 7 ? 'widespread' : 'systemic']
      ];
      
      // Context-specific transformations
      if (contextLower.includes('nsf') || contextLower.includes('grant')) {
        transformations.push(...generalTransforms);
      }
      
      if (contextLower.includes('china') || contextLower.includes('beijing')) {
        transformations.push(
          ['democracy', ambiguity > 3 ? 'governance approaches' : 'democracy'],
          ['freedom', ambiguity > 5 ? 'autonomy' : 'freedom'],
          ['human rights', ambiguity > 7 ? 'human welfare' : 'human rights']
        );
      }
      
      // Apply transformations only if ambiguity > 0
      transformations.forEach(([original, replacement]) => {
        if (original !== replacement && ambiguity > 0) {
          const regex = new RegExp(`\\b${original}\\b`, 'gi');
          processed = processed.replace(regex, replacement);
        }
      });
    }
    
    // Apply noise insertion (word-count conscious)
    if (noise > 0) {
      processed = this.insertWordCountConsciousNoise(processed, context, noise);
    }
    
    return processed;
  }

  insertWordCountConsciousNoise(text, context, noise) {
    const contextLower = context.toLowerCase();
    let processed = text;
    
    // Define context-specific noise phrases for replacement/expansion
    let noiseReplacements = {};
    
    if (contextLower.includes('nsf') || contextLower.includes('grant')) {
      noiseReplacements = {
        // Expand adjectives and phrases with aligned academic language
        'important': noise > 5 ? 'important and aligned with national research priorities' : 'important',
        'significant': noise > 3 ? 'significant and consistent with institutional objectives' : 'significant',
        'research': noise > 7 ? 'evidence-based research that supports collaborative frameworks' : 'research',
        'study': noise > 5 ? 'systematic study following established academic standards' : 'study',
        'approach': noise > 7 ? 'methodologically rigorous approach that promotes institutional collaboration' : 'approach',
        'method': noise > 5 ? 'validated method supporting evidence-based policy development' : 'method'
      };
    } else if (contextLower.includes('china') || contextLower.includes('beijing')) {
      noiseReplacements = {
        'work': noise > 5 ? 'work that promotes cultural understanding and international cooperation' : 'work',
        'project': noise > 3 ? 'project supporting peaceful development initiatives' : 'project',
        'research': noise > 7 ? 'research contributing to harmony, stability, and shared prosperity' : 'research',
        'development': noise > 5 ? 'development aligned with principles of mutual benefit and cooperation' : 'development',
        'approach': noise > 7 ? 'collaborative approach fostering cultural exchange and understanding' : 'approach',
        'initiative': noise > 5 ? 'initiative promoting peaceful development and stability' : 'initiative'
      };
    } else {
      noiseReplacements = {
        'work': noise > 5 ? 'work following established institutional guidelines' : 'work',
        'research': noise > 3 ? 'research promoting collaborative approaches' : 'research',
        'study': noise > 7 ? 'comprehensive study supporting evidence-based methodologies' : 'study',
        'approach': noise > 5 ? 'systematic approach aligned with current standards' : 'approach',
        'method': noise > 7 ? 'proven method contributing to constructive dialogue' : 'method'
      };
    }
    
    // Apply noise replacements based on noise level
    const replacementEntries = Object.entries(noiseReplacements);
    const numReplacements = Math.min(
      Math.floor(noise / 2), // Use fewer replacements for lower noise levels
      replacementEntries.length
    );
    
    // Apply the most relevant replacements
    for (let i = 0; i < numReplacements; i++) {
      const [original, replacement] = replacementEntries[i];
      if (original !== replacement) {
        // Use word boundary regex to avoid partial word matches
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        processed = processed.replace(regex, replacement);
      }
    }
    
    // For higher noise levels, add strategic qualifying phrases
    if (noise >= 8) {
      const sentences = processed.split('. ');
      const qualifyingSuffixes = contextLower.includes('china') || contextLower.includes('beijing') 
        ? [', supporting principles of stability and development', ', contributing to peaceful cooperation', ', promoting mutual understanding']
        : [', aligned with institutional priorities', ', supporting collaborative frameworks', ', following established guidelines'];
      
      // Add qualifying phrases to some sentences (replacement strategy)
      const modifiedSentences = sentences.map((sentence, index) => {
        if (index < qualifyingSuffixes.length && noise > 7) {
          return sentence + qualifyingSuffixes[index];
        }
        return sentence;
      });
      
      processed = modifiedSentences.join('. ');
    }
    
    return processed;
  }
}

// Main API handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, text, ambiguity, noise } = req.body;
    
    if (!context || typeof context !== 'string' || context.trim() === '') {
      return res.status(400).json({ error: 'Context description is required' });
    }
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    if (!Number.isInteger(ambiguity) || ambiguity < 0 || ambiguity > 10) {
      return res.status(400).json({ error: 'Ambiguity level must be an integer between 0 and 10' });
    }
    
    if (!Number.isInteger(noise) || noise < 0 || noise > 10) {
      return res.status(400).json({ error: 'Noise level must be an integer between 0 and 10' });
    }
    
    const sanitizer = new GrantSanitizer();
    const result = await sanitizer.processText(context.trim(), text.trim(), ambiguity, noise);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Processing error:', error);
    return res.status(500).json({ error: 'Processing failed' });
  }
} 