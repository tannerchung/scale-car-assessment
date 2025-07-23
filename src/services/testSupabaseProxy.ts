export async function testSupabaseProxy(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Check if Supabase environment variables are configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return {
        success: false,
        message: 'Supabase environment variables not configured',
        details: {
          hasUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
          hasAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
        }
      };
    }

    console.log('Testing Supabase Claude proxy...');
    
    // Make a simple test request to the Claude proxy
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: "Hello, this is a test. Please respond with just 'OK'."
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { rawError: errorText };
      }

      return {
        success: false,
        message: `Proxy request failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails
        }
      };
    }

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return {
        success: true,
        message: 'Supabase Claude proxy is working correctly',
        details: {
          response: data.content[0].text,
          model: data.model,
          usage: data.usage
        }
      };
    } else {
      return {
        success: false,
        message: 'Unexpected response format from Claude',
        details: data
      };
    }

  } catch (error) {
    return {
      success: false,
      message: `Network or connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        error: error instanceof Error ? error.message : error,
        type: 'NetworkError'
      }
    };
  }
}

export async function testSpecificCredentials(
  url: string,
  key: string
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Validate inputs
    if (!url || !key) {
      return {
        success: false,
        message: 'URL and key are required',
        details: {
          hasUrl: Boolean(url),
          hasKey: Boolean(key)
        }
      };
    }

    console.log('Testing specific Supabase credentials...');
    
    // Make a test request to the Claude proxy with provided credentials
    const response = await fetch(`${url}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: "Hello, this is a test. Please respond with just 'OK'."
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { rawError: errorText };
      }

      return {
        success: false,
        message: `Test request failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
          testedUrl: url.substring(0, 30) + '...',
          testedKey: key.substring(0, 20) + '...'
        }
      };
    }

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return {
        success: true,
        message: 'Test credentials work correctly',
        details: {
          response: data.content[0].text,
          model: data.model,
          usage: data.usage,
          testedUrl: url.substring(0, 30) + '...',
          testedKey: key.substring(0, 20) + '...'
        }
      };
    } else {
      return {
        success: false,
        message: 'Unexpected response format from Claude',
        details: {
          ...data,
          testedUrl: url.substring(0, 30) + '...',
          testedKey: key.substring(0, 20) + '...'
        }
      };
    }

  } catch (error) {
    return {
      success: false,
      message: `Network or connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        error: error instanceof Error ? error.message : error,
        type: 'NetworkError',
        testedUrl: url.substring(0, 30) + '...',
        testedKey: key.substring(0, 20) + '...'
      }
    };
  }
}