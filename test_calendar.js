// Test calendar service directly
const testICalUrl = 'webcal://p156-caldav.icloud.com/published/2/MTAwNzY2MDA3MDEwMDc2NrtCBhWygjcyGrkM1y6_FWNPJtti8zyg4mfKNMGpQEztC2yqc8jIpbHBajWDNvxNfswpt6m8tXe1Xgr84yRUmRU';

async function testCalendar() {
  console.log('Testing iCal URL:', testICalUrl);
  
  // Convert webcal to https
  const fetchUrl = testICalUrl.replace(/^webcal:\/\//, 'https://');
  console.log('Converted URL:', fetchUrl);
  
  // Try the CORS proxy that was working
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
  console.log('Proxy URL:', proxyUrl);
  
  try {
    const response = await fetch(proxyUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Data length:', data.length);
    console.log('First 500 chars:', data.substring(0, 500));
    
    // Check for calendar data
    if (data.includes('BEGIN:VCALENDAR')) {
      console.log('✅ Found calendar data');
      
      // Count events
      const eventBlocks = data.split('BEGIN:VEVENT');
      console.log('Total events found:', eventBlocks.length - 1);
      
      // Show all event titles
      const summaryLines = data.split('\n').filter(line => line.includes('SUMMARY:'));
      console.log('Event titles:', summaryLines);
      
      // Show all DTSTART lines
      const dtstartLines = data.split('\n').filter(line => line.includes('DTSTART'));
      console.log('Event start dates:', dtstartLines);
      
    } else {
      console.log('❌ No calendar data found');
      console.log('Full response:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCalendar();
