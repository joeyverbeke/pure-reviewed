class GrantSanitizer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.apiUrl = this.getApiUrl();
    }

    initializeElements() {
        this.contextText = document.getElementById('context-text');
        this.inputText = document.getElementById('input-text');
        this.outputText = document.getElementById('output-text');
        this.ambiguitySlider = document.getElementById('ambiguity-slider');
        this.noiseSlider = document.getElementById('noise-slider');
        this.processBtn = document.getElementById('process-btn');
        this.loading = document.getElementById('loading');
        this.modificationSummary = document.getElementById('modification-summary');
    }

    bindEvents() {
        this.processBtn.addEventListener('click', () => this.processText());
        this.ambiguitySlider.addEventListener('input', () => this.updateSliderDisplay());
        this.noiseSlider.addEventListener('input', () => this.updateSliderDisplay());
        
        // Allow Ctrl+Enter to process text
        this.inputText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.processText();
            }
        });
        
        this.contextText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.processText();
            }
        });
    }

    getApiUrl() {
        // For Vercel deployment, API routes are available at /api/*
        // This works both in development (vercel dev) and production
        return '/api';
    }

    updateSliderDisplay() {
        const ambiguityValue = this.ambiguitySlider.value;
        const noiseValue = this.noiseSlider.value;
        // Could add real-time feedback here if needed
        console.log(`Ambiguity: ${ambiguityValue}, Noise: ${noiseValue}`);
    }

    async processText() {
        const contextValue = this.contextText.value.trim();
        const inputValue = this.inputText.value.trim();
        
        if (!contextValue) {
            alert('Please describe the context for your writing (what you\'re writing for).');
            return;
        }
        
        if (!inputValue) {
            alert('Please enter some text to process.');
            return;
        }

        this.showLoading(true);
        this.processBtn.disabled = true;

        try {
            const response = await this.callAPI(
                contextValue, 
                inputValue, 
                parseInt(this.ambiguitySlider.value),
                parseInt(this.noiseSlider.value)
            );
            this.displayResults(response);
        } catch (error) {
            console.error('Error processing text:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
            this.processBtn.disabled = false;
        }
    }

    async callAPI(context, text, ambiguity, noise) {
        // For demo purposes, if API is not available, use mock response
        try {
            const response = await fetch(`${this.apiUrl}/sanitize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context: context,
                    text: text,
                    ambiguity: ambiguity,
                    noise: noise
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('API not available, using mock response:', error);
            return this.getMockResponse(context, text, ambiguity, noise);
        }
    }

    getMockResponse(context, text, ambiguity, noise) {
        // Mock response for when API is not available
        const processedText = this.mockProcess(text, context, ambiguity, noise);
        
        const originalWordCount = text.split(/\s+/).length;
        const processedWordCount = processedText.split(/\s+/).length;
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
        
        return {
            summary: `**Context Analysis:** Based on "${context}", applied targeted modifications.\n\n` +
                    `**Ambiguity Level (${ambiguity}/10):** ${ambiguityDesc}\n\n` +
                    `**Noise Level (${noise}/10):** ${noiseDesc}\n\n` +
                    `**Word Count Impact:** ${originalWordCount} → ${processedWordCount} words (${wordCountChange >= 0 ? '+' : ''}${wordCountChange}, ${wordCountChangePercent}%)\n\n` +
                    `The text has been strategically modified while preserving your core message and intent.`,
            processed_text: processedText
        };
    }

    mockProcess(text, context, ambiguity, noise) {
        let processed = text;
        
        // Apply ambiguity transformations based on context
        if (ambiguity > 0) {
            processed = this.applyAmbiguity(processed, context, ambiguity);
        }
        
        // Apply noise insertion based on context
        if (noise > 0) {
            processed = this.insertNoise(processed, context, noise);
        }
        
        return processed;
    }
    
    applyAmbiguity(text, context, level) {
        // If ambiguity is 0, return text unchanged
        if (level === 0) {
            return text;
        }
        
        let processed = text;
        const contextLower = context.toLowerCase();
        
        // Context-aware ambiguity transformations
        const transformations = [];
        
        // Add general ambiguity transformations
        const generalTransforms = [
            ['feminist', level > 5 ? 'gender-focused' : 'feminist'],
            ['socialism', level > 5 ? 'alternative economic approaches' : 'socialism'],
            ['climate change', level > 3 ? 'environmental considerations' : 'climate change'],
            ['racism', level > 5 ? 'social disparities' : 'racism'],
            ['inequality', level > 3 ? 'differential outcomes' : 'inequality'],
            ['oppression', level > 5 ? 'structural limitations' : 'oppression'],
            ['liberation', level > 7 ? 'empowerment' : 'liberation'],
            ['revolution', level > 3 ? 'transformation' : 'revolution'],
            ['radical', level > 5 ? 'alternative' : 'radical'],
            ['systemic', level > 7 ? 'widespread' : 'systemic']
        ];
        
        // Apply context-specific transformations
        if (contextLower.includes('nsf') || contextLower.includes('grant')) {
            transformations.push(
                ...generalTransforms,
                ['critical theory', level > 5 ? 'theoretical frameworks' : 'critical theory'],
                ['decoloniz', level > 7 ? 'alternative perspectives on' : 'decoloniz']
            );
        }
        
        if (contextLower.includes('china') || contextLower.includes('beijing')) {
            transformations.push(
                ['democracy', level > 3 ? 'governance approaches' : 'democracy'],
                ['freedom', level > 5 ? 'autonomy' : 'freedom'],
                ['human rights', level > 7 ? 'human welfare' : 'human rights'],
                ['protest', level > 5 ? 'public expression' : 'protest'],
                ['censorship', level > 7 ? 'information management' : 'censorship']
            );
        }
        
        // Apply transformations
        transformations.forEach(([original, replacement]) => {
            if (original !== replacement) {
                const regex = new RegExp(`\\b${original}\\b`, 'gi');
                processed = processed.replace(regex, replacement);
            }
        });
        
        return processed;
    }
    
    insertNoise(text, context, level) {
        if (level === 0) return text;
        
        const contextLower = context.toLowerCase();
        let processed = text;
        
        // Define context-specific noise phrases for replacement/expansion
        let noiseReplacements = {};
        
        if (contextLower.includes('nsf') || contextLower.includes('grant')) {
            noiseReplacements = {
                'important': level > 5 ? 'important and aligned with national research priorities' : 'important',
                'significant': level > 3 ? 'significant and consistent with institutional objectives' : 'significant',
                'research': level > 7 ? 'evidence-based research that supports collaborative frameworks' : 'research',
                'study': level > 5 ? 'systematic study following established academic standards' : 'study',
                'approach': level > 7 ? 'methodologically rigorous approach that promotes institutional collaboration' : 'approach',
                'method': level > 5 ? 'validated method supporting evidence-based policy development' : 'method'
            };
        } else if (contextLower.includes('china') || contextLower.includes('beijing')) {
            noiseReplacements = {
                'work': level > 5 ? 'work that promotes cultural understanding and international cooperation' : 'work',
                'project': level > 3 ? 'project supporting peaceful development initiatives' : 'project',
                'research': level > 7 ? 'research contributing to harmony, stability, and shared prosperity' : 'research',
                'development': level > 5 ? 'development aligned with principles of mutual benefit and cooperation' : 'development',
                'approach': level > 7 ? 'collaborative approach fostering cultural exchange and understanding' : 'approach',
                'initiative': level > 5 ? 'initiative promoting peaceful development and stability' : 'initiative'
            };
        } else {
            noiseReplacements = {
                'work': level > 5 ? 'work following established institutional guidelines' : 'work',
                'research': level > 3 ? 'research promoting collaborative approaches' : 'research',
                'study': level > 7 ? 'comprehensive study supporting evidence-based methodologies' : 'study',
                'approach': level > 5 ? 'systematic approach aligned with current standards' : 'approach',
                'method': level > 7 ? 'proven method contributing to constructive dialogue' : 'method'
            };
        }
        
        // Apply noise replacements based on noise level
        const replacementEntries = Object.entries(noiseReplacements);
        const numReplacements = Math.min(
            Math.floor(level / 2), // Use fewer replacements for lower noise levels
            replacementEntries.length
        );
        
        // Apply the most relevant replacements
        for (let i = 0; i < numReplacements; i++) {
            const [original, replacement] = replacementEntries[i];
            if (original !== replacement) {
                const regex = new RegExp(`\\b${original}\\b`, 'gi');
                processed = processed.replace(regex, replacement);
            }
        }
        
        // For higher noise levels, add strategic qualifying phrases
        if (level >= 8) {
            const sentences = processed.split('. ');
            const qualifyingSuffixes = contextLower.includes('china') || contextLower.includes('beijing') 
                ? [', supporting principles of stability and development', ', contributing to peaceful cooperation', ', promoting mutual understanding']
                : [', aligned with institutional priorities', ', supporting collaborative frameworks', ', following established guidelines'];
            
            // Add qualifying phrases to some sentences (replacement strategy)
            const modifiedSentences = sentences.map((sentence, index) => {
                if (index < qualifyingSuffixes.length && level > 7) {
                    return sentence + qualifyingSuffixes[index];
                }
                return sentence;
            });
            
            processed = modifiedSentences.join('. ');
        }
        
        return processed;
    }

    displayResults(response) {
        this.outputText.value = response.processed_text || 'No processed text available';
        const summaryHtml = (response.summary || 'No summary provided').replace(/\n/g, '<br>');
        this.modificationSummary.innerHTML = `<h4>Modifications Applied:</h4><p>${summaryHtml}</p>`;
    }

    showError(message) {
        this.modificationSummary.innerHTML = `<h4>Error:</h4><p>${message}</p>`;
        this.outputText.value = 'Processing failed. Please try again.';
    }

    showLoading(show) {
        this.loading.style.display = show ? 'flex' : 'none';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GrantSanitizer();
});

// Add some sample text for demonstration
document.addEventListener('DOMContentLoaded', () => {
    const sampleContext = `NSF grant proposal for social science research`;
    const sampleText = `This groundbreaking research proposal aims to examine how feminist epistemologies can revolutionize our understanding of climate justice. The urgent need for radical approaches to address systemic environmental inequality makes this work essential. Our transformative methodology represents a paradigm shift in addressing oppression within environmental movements, promising to liberate marginalized voices in climate activism.`;
    
    document.getElementById('context-text').placeholder = `Describe what you're writing for...\n\nExample: ${sampleContext}`;
    document.getElementById('input-text').placeholder = `Paste your original text here...\n\nExample:\n${sampleText}`;
}); 