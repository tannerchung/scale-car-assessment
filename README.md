# AI-Powered Auto Insurance Claims Assessment System

This application demonstrates a real-time, AI-driven system for assessing auto insurance claims, providing damage detection, cost estimation, and automated approval workflows using advanced AI technologies including Claude from Anthropic.

![Insurance Claims Assessment](https://i.imgur.com/vk22HFx.jpeg)

## 🚀 Features

- **Multi-model AI Architecture**: Combines Google Vision API and Claude AI for comprehensive damage assessment and vehicle analysis
- **Damage Detection & Classification**: Advanced vision models identify, classify, and assess vehicle damage severity
- **Natural Language Analysis**: Claude AI analyzes damage images with pixel-perfect coordinate mapping
- **Cost Estimation**: Generates repair cost breakdowns based on detected damage and regional factors
- **Confidence Scoring**: Implements a tiered review system based on AI confidence levels
- **Historical Comparison**: Compares estimates with similar past claims
- **Adjuster Dashboard**: User-friendly interface for claim management and review
- **Multi-step Upload Process**: Guided workflow from photo upload to assessment results

![Assessment App Features](https://i.imgur.com/mpdQQ6S.jpeg)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Anthropic API key (Claude)
- Google Cloud Vision API key (optional, can run in mock mode)
- Supabase account (for deploying the Claude proxy function)

### Environment Setup

Create a `.env` file in the project root with:

```
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_GOOGLE_CLOUD_API_KEY=your_google_vision_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Even without API keys, the application can run in mock mode using simulated AI responses.

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/auto-claims-assessment.git
cd auto-claims-assessment
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: TailwindCSS for styling
- **Routing**: React Router for navigation
- **State Management**: React Context and Zustand for state management
- **Visualization**: Custom React components for data visualization
- **Image Processing**: Client-side processing with browser APIs
- **AI Integration**: Claude AI via Supabase Edge Functions and Google Vision API
- **Icons**: Lucide React for consistent UI icons

### Configuration Options

The application includes several important settings that can be configured in the Settings page:

1. **AI Provider Selection**:
   - **Claude AI Only**: Uses only Claude for image analysis
   - **Google Vision API Only**: Uses only Google Vision API
   - **Both Providers**: Combines results from both AI systems for enhanced accuracy

2. **Debug Mode**:
   - **Vision API Debug**: Enables detailed logging for Google Vision API requests and responses
   - **Claude API Debug**: Shows raw Claude API responses and analysis
   - These modes are helpful for developers to understand what the AI models are detecting

3. **Mock Data Mode**:
   - The system can run completely with simulated AI responses without requiring actual API keys
   - Enable this by setting `useRealApi: false` in the configuration
   - Useful for development, demonstrations, or when API quota is limited

4. **Confidence Thresholds**:
   - Adjustable settings for auto-approval, quick review, and detailed review thresholds
   - Customize the routing logic based on your organization's risk tolerance

### Data Flow

1. User uploads a vehicle damage photo
2. The system processes the image through multiple AI models:
   - Google Vision API for initial object detection (optional)
   - Claude AI for in-depth damage analysis and coordinate mapping
3. AI analysis produces:
   - Vehicle identification
   - Damage assessment with severity classification
   - Affected areas with confidence scores and precise coordinates
   - Repair cost estimates based on regional factors
   - Historical comparison with similar claims
4. Results are displayed with appropriate visualization
5. Claims are stored in application state (would be persisted to a database in production)

![AI-Enhanced Insurance Claim Flow](https://i.imgur.com/aqpPluz.jpeg)

## 🧠 AI Implementation

### Claude AI Integration

Claude AI is used for advanced damage analysis with several key capabilities:

1. **Precise Damage Localization**: Identifies damaged areas with pixel-accurate coordinates
2. **Severity Classification**: Categorizes damage as Minor, Moderate, or Severe
3. **Cost Estimation**: Provides repair cost estimates based on damage analysis
4. **Vehicle Identification**: Identifies vehicle make and model with confidence scores

The system uses Supabase Edge Functions to securely proxy requests to Anthropic's API. This approach:
- Keeps API keys secure on the server side
- Provides consistent interface for the frontend
- Allows for middleware logging and error handling

Claude receives instructions to analyze the car image and return a structured JSON response with damage details and coordinates, making it ideal for precise assessment.

### Vision API Implementation

As an optional component, the system can use Google Cloud Vision API for:

1. **Object Detection**: Identifies vehicle components
2. **Label Detection**: Classifies damage types
3. **Image Properties**: Analyzes vehicle color and other properties

### Multi-model Approach (When Using Both)

When both AI systems are enabled, the application:

1. First processes the image through Google Vision API for initial object detection
2. Passes those results to Claude along with the image for deeper analysis
3. Combines confidence scores and detections from both models
4. Provides more accurate damage assessment than either model alone

### Mock Data Mode

For development or demonstration purposes, the system includes a comprehensive mock data generation system that:

1. Creates realistic claim data with appropriate distributions
2. Simulates various confidence levels and damage types
3. Works without requiring any API keys or external services
4. Useful for UI development and testing the assessment workflow

Toggle between real and mock APIs in the config:

```typescript
// In config.ts
export const config = {
  vision: {
    useRealApi: true, // Set to false for mock mode
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
    // ...
  },
  anthropic: {
    useRealApi: true, // Set to false for mock mode
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    // ...
  }
};
```

### Confidence Scoring System

The application implements an intelligent routing system based on confidence scores:

```typescript
// Simplified example of confidence logic
export const getReviewType = (
  confidenceScore: number,
  claim: AssessmentResult
): { type: ReviewType; escalationReason?: EscalationReason } => {
  // Auto-approve high confidence claims with no issues
  if (confidenceScore > 90 && 
      claim.damage.confidence >= 85 && 
      !claim.damage.affectedAreas.some(area => area.confidence < 85)) {
    return { type: 'auto' };
  }

  // Check for image quality issues
  const hasImageQualityIssues = claim.damage.affectedAreas.some(area => area.confidence < 75);
  if (hasImageQualityIssues) {
    return {
      type: 'specialist',
      escalationReason: 'data_quality'
    };
  }

  // More logic for other routing decisions...
}
```

## 📊 Dashboard Analytics

The metrics page provides insights into system performance:
- Processing time reduction
- Auto-approval rates
- Adjuster productivity
- Decision and cost estimation accuracy
- Customer satisfaction

## 🔄 Routing Logic

The application implements an intelligent routing system based on confidence scores:

- **High Confidence (90%+)**: Auto-approval (< 1 minute)
- **Medium Confidence (80-90%)**: Quick human review (~10 minutes)
- **Low Confidence (<80%)**: Detailed human review (~25 minutes)
- **Complex Cases**: Specialist review (structural damage, multiple areas)

## 🔍 Design Explanation

### AI Model Selection

The project uses a multi-model approach combining Claude AI and optional Google Vision API because:

1. **Complementary Strengths**: Claude excels at detailed analysis and coordinate mapping, while Vision API is optimized for object detection
2. **Flexibility**: The system can operate with either or both AI providers
3. **Resilience**: If one provider has downtime, the other can continue to function
4. **Cost Optimization**: Vision API costs can be reduced by using Claude's advanced capabilities

### UI/UX Design Principles

1. **Step-by-Step Process**: Clear workflow guides users through each stage
2. **Visual Feedback**: Damage overlay shows exactly where issues are detected
3. **Confidence Indicators**: Visual cues show how certain the AI is about each assessment
4. **Transparent Analysis**: Detailed breakdowns of costs and comparisons

## 🔮 Future Improvements

Given more time and resources, we would implement:

1. **Backend Integration**:
   - Connect to actual AI models via AWS SageMaker or Google Cloud Vision
   - Implement real-time processing with WebSockets for status updates

2. **Enhanced Claude Integration**:
   - Fine-tuning on insurance-specific datasets
   - Multi-image analysis for comprehensive damage assessment
   - Integration with repair shop databases for more accurate cost estimation

3. **Database Storage**:
   - PostgreSQL with Prisma ORM for claim persistence
   - Redis for caching frequently accessed data

4. **Authentication & Authorization**:
   - Role-based access control for adjusters, managers, and admins
   - OAuth integration for enterprise SSO

5. **Enhanced Analytics**:
   - Trend analysis for claims patterns
   - Adjuster performance metrics
   - ROI calculation for AI-assisted vs. manual processing

6. **Mobile Optimization**:
   - Native app wrapper with React Native 
   - Camera integration for direct capture of damage photos

7. **Machine Learning Improvements**:
   - Continuous learning from adjuster corrections
   - A/B testing of different confidence thresholds
   - Model retraining based on regional differences

## 📝 License

MIT

## 👨‍💻 Author

Tanner Chung
