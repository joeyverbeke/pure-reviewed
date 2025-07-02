class PureReviewedApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupSliderValues();
    }

    initializeElements() {
        this.contextInput = document.getElementById('context-input');
        this.inputText = document.getElementById('input-text');
        this.outputText = document.getElementById('output-text');
        this.ambiguitySlider = document.getElementById('ambiguity-slider');
        this.noiseSlider = document.getElementById('noise-slider');
        this.ambiguityValue = document.getElementById('ambiguity-value');
        this.noiseValue = document.getElementById('noise-value');
        this.convertBtn = document.getElementById('convert-btn');
        this.modificationSummary = document.getElementById('modification-summary');
    }

    setupEventListeners() {
        this.convertBtn.addEventListener('click', () => this.processText());
        
        // Allow processing with Enter key in text areas
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.processText();
            }
        });
        
        this.contextInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processText();
            }
        });
    }

    setupSliderValues() {
        // Update slider value displays
        this.ambiguitySlider.addEventListener('input', (e) => {
            this.ambiguityValue.textContent = e.target.value;
        });
        
        this.noiseSlider.addEventListener('input', (e) => {
            this.noiseValue.textContent = e.target.value;
        });
    }

    async processText() {
        const context = this.contextInput.value.trim() || 'general application';
        const text = this.inputText.value.trim();
        const ambiguity = parseInt(this.ambiguitySlider.value);
        const noise = parseInt(this.noiseSlider.value);

        if (!text) {
            alert('Please enter some text to process.');
            return;
        }

        this.setProcessing(true);

        try {
            const result = await this.callAPI(context, text, ambiguity, noise);
            this.displayResults(result);
        } catch (error) {
            console.warn('API call failed, using mock processing:', error);
            const result = this.getMockResponse(context, text, ambiguity, noise);
            this.displayResults(result);
        } finally {
            this.setProcessing(false);
        }
    }

    async callAPI(context, text, ambiguity, noise) {
        const response = await fetch('/api/sanitize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                context,
                text,
                ambiguity,
                noise
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    displayResults(result) {
        this.outputText.value = result.processed_text;
        this.modificationSummary.textContent = result.summary;
    }

    setProcessing(isProcessing) {
        this.convertBtn.disabled = isProcessing;
        this.convertBtn.textContent = isProcessing ? 'processing...' : 'convert';
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
            summary: `Context Analysis: Based on "${context}", applied targeted modifications.\n\nAmbiguity Level (${ambiguity}/10): ${ambiguityDesc}\n\nNoise Level (${noise}/10): ${noiseDesc}\n\nWord Count Impact: ${originalWordCount} → ${processedWordCount} words (${wordCountChange >= 0 ? '+' : ''}${wordCountChange}, ${wordCountChangePercent}%)\n\nThe text has been strategically modified while preserving your core message and intent.`,
            processed_text: processedText
        };
    }

    mockProcess(text, context, ambiguity, noise) {
        // Apply ambiguity transformations
        let processed = this.applyAmbiguity(text, context, ambiguity);
        
        // Apply noise insertion
        processed = this.insertNoise(processed, context, noise);
        
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
        
        // Add context-specific transformations
        if (contextLower.includes('nsf') || contextLower.includes('grant')) {
            transformations.push(...generalTransforms);
        }
        
        if (contextLower.includes('china') || contextLower.includes('beijing')) {
            transformations.push(
                ['democracy', level > 3 ? 'governance approaches' : 'democracy'],
                ['freedom', level > 5 ? 'autonomy' : 'freedom'],
                ['human rights', level > 7 ? 'human welfare' : 'human rights'],
                ['censorship', level > 5 ? 'content moderation' : 'censorship']
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
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PureReviewedApp();
}); 