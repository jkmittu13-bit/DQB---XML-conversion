
export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast & Efficient)', description: 'Best for standard assessments and quick conversion.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Advanced Reasoning)', description: 'Superior for complex STEM questions and nuanced formatting.' },
];

export const DEFAULT_SYSTEM_PROMPT = `You are a professional QTI 2.2 content parser and generator.

Your task is to analyze the provided raw text (extracted from a PDF or TXT file)
and split it into individual questions.

For EACH question found in the text, return a JSON object with EXACTLY the following keys:

1. category
   - Type: string
   - Must match the category text exactly as written in the source.

2. question
   - Type: string
   - The complete question stem including choices.
   - Preserve original formatting (Line breaks, bullet points).

3. correct_answer
   - Type: string
   - Extract the identified correct answer.

4. images
   - Type: array of strings
   - Use references like "IMAGE_REF_0", "IMAGE_REF_1", etc. if an image belongs to the question.

---

### OUTPUT RULES
- Return ONLY a valid JSON ARRAY.
- Do NOT include Markdown formatting.
- Do NOT skip any questions; ensure 100% conversion fidelity.`;

export const MAX_FILE_SIZE_MB = 10;

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Crect width='200' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3EImage Missing%3C/text%3E%3C/svg%3E";

/**
 * Transforms a question JSON object into a QTI XML string.
 */
export const renderQuestionToQTI = (q: any, id: number): string => {
  const imagesXml = q.images && q.images.length > 0 
    ? q.images.map((img: string) => {
        const src = img && img.startsWith('data:') ? img : PLACEHOLDER_IMAGE;
        return `      <img src="${src}" alt="Instructional diagram for question ${id}"/>`;
      }).join('\n')
    : '';

  return `
<assessmentItem identifier="q${id}" adaptive="false" timeDependent="false" category="${q.category}" label="BOOKQUESTION">
  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
    <correctResponse>
      <value><![CDATA[${q.correct_answer}]]></value>
    </correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"/>
  <itemBody>
    <div data="BOOKQUESTION">
      <p><![CDATA[${q.question}]]></p>
${imagesXml}
    </div>
    <extendedTextInteraction responseIdentifier="RESPONSE" expectedLength="200">
      <prompt></prompt>
    </extendedTextInteraction>
  </itemBody>
</assessmentItem>`.trim();
};
