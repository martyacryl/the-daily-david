// Bible Service for integrating with API.Bible
// This will handle scripture retrieval and integration with SOAP study

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  abbreviation: string;
}

export interface BibleVerse {
  id: string;
  reference: string;
  content: string;
  copyright: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  titles?: string[];
  themes?: string[];
  verses?: string[];
}

export interface DevotionDay {
  date: string;
  verses: BibleVerse[];
  title: string;
  content: string;
}

class BibleService {
  private apiKey: string;
  private baseUrl = 'https://api.scripture.api.bible/v1';
  private defaultBibleId = 'de4e12af7f28f599-02'; // ESV Bible ID

  constructor(apiKey?: string) {
    // API.Bible API key for The Daily David app
    this.apiKey = apiKey || '580329b134bf13e4305a57695080195b';
  }

  // Get available Bible versions
  async getBibleVersions(): Promise<BibleVersion[]> {
    // Return only ESV and NIV for now
    return [
      { id: 'de4e12af7f28f599-02', name: 'English Standard Version', language: 'English', abbreviation: 'ESV' },
      { id: '65eec8e0b60e656b-01', name: 'New International Version', language: 'English', abbreviation: 'NIV' }
    ];
  }

  // Get a specific verse
  async getVerse(bibleId: string, verseId: string): Promise<BibleVerse | null> {
    if (!this.apiKey) {
      console.warn('No API key provided. Please get an API key from API.Bible to use real scripture data.');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/bibles/${bibleId}/verses/${verseId}`, {
        headers: { 'api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          id: data.data.id,
          reference: data.data.reference,
          content: this.cleanHtmlContent(data.data.content),
          copyright: data.data.copyright || 'Bible'
        };
      } else {
        console.error('API.Bible error:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching verse from API.Bible:', error);
      return null;
    }
  }

  // Search for verses
  async searchVerses(bibleId: string, query: string): Promise<BibleVerse[]> {
    if (!this.apiKey) {
      console.warn('No API key provided. Please get an API key from API.Bible to search scripture.');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}`, {
        headers: { 'api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.verses?.map((verse: any) => ({
          id: verse.id,
          reference: verse.reference,
          content: this.cleanHtmlContent(verse.content),
          copyright: verse.copyright || 'Bible'
        })) || [];
      } else {
        console.error('API.Bible search error:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  // Get reading plans (Note: API.Bible doesn't provide reading plans)
  // This would need to be custom content or integration with other services
  async getReadingPlans(): Promise<ReadingPlan[]> {
    // API.Bible doesn't provide reading plans - this would be custom content
    // We can create our own manly devotional tracks using their scripture API
    return [
      {
        id: 'warrior-psalms',
        name: 'Warrior Psalms',
        description: '30 days of Psalms focused on strength, courage, and leadership',
        duration: 30,
        titles: [
          'The Warrior\'s Strength', 'Courage in Battle', 'Stand Strong', 'God Our Fortress', 'Divine Protection',
          'Victory Through Faith', 'The Lord is My Rock', 'Fearless in Battle', 'God\'s Right Hand', 'Mighty Warrior',
          'Strength in Weakness', 'Unshakeable Faith', 'Divine Shield', 'Conquering Spirit', 'God\'s Army',
          'Battle Cry', 'Victory Song', 'Divine Justice', 'Unstoppable Force', 'God\'s Champion',
          'Rising Above', 'Divine Power', 'Unbreakable Bond', 'God\'s Victory', 'Eternal Strength',
          'Spiritual Warfare', 'Divine Authority', 'Unconquerable Spirit', 'God\'s Might', 'Final Victory'
        ],
        themes: [
          'Finding strength in God during spiritual battles', 'Courage to face life\'s challenges with faith', 'Standing firm in your convictions', 'Trusting God as your ultimate refuge', 'Resting in God\'s protection and care',
          'Victory comes through faith, not strength', 'God as your unshakeable foundation', 'Facing fears with divine courage', 'God\'s power working through you', 'Being God\'s instrument of justice',
          'Finding power in humility and dependence', 'Faith that moves mountains', 'God\'s protection in every storm', 'The spirit of a conqueror', 'Being part of God\'s eternal army',
          'Raising your voice for truth', 'Celebrating God\'s victories', 'Seeking divine justice in the world', 'Unstoppable when aligned with God', 'Being God\'s chosen champion',
          'Rising above circumstances', 'Accessing God\'s unlimited power', 'Unbreakable connection with the divine', 'God\'s ultimate victory over evil', 'Drawing from eternal strength',
          'Engaging in spiritual battles', 'Operating in divine authority', 'Spirit that cannot be defeated', 'Experiencing God\'s mighty power', 'The final victory that awaits'
        ],
        verses: [
          'PSA.18.1-PSA.18.3', 'PSA.27.1-PSA.27.3', 'PSA.31.24', 'PSA.46.1-PSA.46.3', 'PSA.91.1-PSA.91.4',
          'PSA.20.7', 'PSA.18.2', 'PSA.23.4', 'PSA.16.8', 'PSA.144.1',
          'PSA.73.26', 'PSA.37.5', 'PSA.3.3', 'PSA.18.39', 'PSA.68.17',
          'PSA.47.1', 'PSA.98.1', 'PSA.7.11', 'PSA.18.32', 'PSA.89.19',
          'PSA.30.1', 'PSA.62.11', 'PSA.63.8', 'PSA.21.1', 'PSA.29.11',
          'PSA.144.1', 'PSA.29.4', 'PSA.18.37', 'PSA.68.35', 'PSA.21.13'
        ]
      },
      {
        id: 'leadership-proverbs',
        name: 'Leadership Proverbs',
        description: 'Daily wisdom from Proverbs for godly leadership',
        duration: 31,
        titles: [
          'Divine Planning', 'Iron Sharpens Iron', 'Vision & Leadership', 'Speak Up for Justice', 'Diligent Work',
          'Wise Counsel', 'Patient Leadership', 'Righteous Judgment', 'Humble Service', 'Integrity First',
          'Disciplined Life', 'Generous Heart', 'Peaceful Resolution', 'Honest Communication', 'Faithful Stewardship',
          'Mentoring Others', 'Courageous Decisions', 'Servant Leadership', 'Wise Investments', 'Righteous Anger',
          'Team Building', 'Conflict Resolution', 'Long-term Thinking', 'Character Development', 'Spiritual Growth',
          'Leading by Example', 'Building Trust', 'Making Sacrifices', 'Seeking Wisdom', 'Finishing Strong', 'Legacy Building'
        ],
        themes: [
          'Planning your path while trusting God\'s direction', 'The importance of godly friendships and accountability', 'Leading with vision and purpose', 'Using your voice to defend the vulnerable', 'The value of hard work and diligence',
          'Seeking wise counsel before making decisions', 'Leading with patience and understanding', 'Making fair and just decisions', 'Leading through humble service', 'Maintaining integrity in all situations',
          'Living a disciplined and ordered life', 'Leading with generosity and compassion', 'Resolving conflicts peacefully', 'Communicating with honesty and clarity', 'Managing resources faithfully',
          'Investing in the next generation', 'Making difficult decisions with courage', 'Leading by serving others', 'Making wise investments in people and resources', 'Channeling anger into righteous action',
          'Building strong, unified teams', 'Resolving conflicts with wisdom', 'Thinking beyond immediate results', 'Developing character in yourself and others', 'Prioritizing spiritual growth',
          'Leading through your actions, not just words', 'Building trust through consistency', 'Making personal sacrifices for the team', 'Continuously seeking divine wisdom', 'Finishing what you start', 'Building a lasting legacy'
        ],
        verses: [
          'PRO.16.9', 'PRO.27.17', 'PRO.29.18', 'PRO.31.8-PRO.31.9', 'PRO.14.23',
          'PRO.11.14', 'PRO.15.18', 'PRO.21.3', 'PRO.27.18', 'PRO.10.9',
          'PRO.25.28', 'PRO.11.25', 'PRO.15.1', 'PRO.12.22', 'PRO.27.23',
          'PRO.22.6', 'PRO.28.1', 'PRO.27.2', 'PRO.13.11', 'PRO.15.1',
          'PRO.15.22', 'PRO.16.7', 'PRO.19.21', 'PRO.22.1', 'PRO.9.10',
          'PRO.20.7', 'PRO.3.5', 'PRO.17.17', 'PRO.2.6', 'PRO.16.3', 'PRO.13.22'
        ]
      },
      {
        id: 'courage-joshua',
        name: 'Courage & Conquest',
        description: 'Study Joshua and Judges for lessons in courage and faith',
        duration: 24,
        titles: [
          'Be Strong and Courageous', 'Crossing the Jordan', 'The Battle of Jericho', 'Standing Firm', 'Victory Through Faith',
          'Spy Mission', 'Rahab\'s Faith', 'Memorial Stones', 'Circumcision at Gilgal', 'Commander\'s Sword',
          'Achan\'s Sin', 'Ai Defeat', 'Ai Victory', 'Altar on Mount Ebal', 'Reading the Law',
          'Gibeon\'s Deception', 'Sun Stands Still', 'Southern Campaign', 'Northern Campaign', 'Land Division',
          'Cities of Refuge', 'Levitical Cities', 'Eastern Tribes Return', 'Joshua\'s Farewell'
        ],
        themes: [
          'God\'s command to be strong and courageous', 'Trusting God to lead you through impossible situations', 'Following God\'s unconventional battle plans', 'Standing firm when others fall away', 'Victory comes through faith, not strength',
          'Gathering intelligence and preparing for battle', 'Faith that transcends background and circumstances', 'Remembering God\'s faithfulness in the past', 'Renewing your commitment to God', 'Recognizing God\'s authority in your life',
          'The consequences of disobedience and hidden sin', 'Learning from failure and defeat', 'Victory through obedience and strategy', 'Worship and commitment to God\'s law', 'The importance of knowing God\'s word',
          'Dealing with deception and making wise alliances', 'God\'s miraculous intervention in impossible situations', 'Systematic conquest of obstacles', 'Completing the work God has given you', 'Fair distribution of blessings and responsibilities',
          'Providing safety and refuge for others', 'Supporting those who serve God', 'Keeping your promises and commitments', 'Leaving a legacy of faithfulness'
        ],
        verses: [
          'JOS.1.9', 'JOS.3.15-JOS.3.17', 'JOS.6.20', 'JOS.24.15', 'JOS.21.45',
          'JOS.2.1', 'JOS.2.11', 'JOS.4.7', 'JOS.5.9', 'JOS.5.14',
          'JOS.7.11', 'JOS.7.5', 'JOS.8.1', 'JOS.8.30', 'JOS.8.34',
          'JOS.9.14', 'JOS.10.13', 'JOS.10.40', 'JOS.11.23', 'JOS.14.2',
          'JOS.20.2', 'JOS.21.2', 'JOS.22.4', 'JOS.24.15'
        ]
      },
      {
        id: 'strength-isaiah',
        name: 'Strength in Isaiah',
        description: 'Isaiah\'s messages of strength and hope for men',
        duration: 66,
        titles: [
          'Wings Like Eagles', 'The Lord is My Strength', 'Fear Not', 'God\'s Power', 'Everlasting Strength',
          'Holy One of Israel', 'Prince of Peace', 'Wonderful Counselor', 'Mighty God', 'Everlasting Father',
          'Light in Darkness', 'Refuge in Storm', 'Healer of Broken Hearts', 'Restorer of Hope', 'Comforter in Sorrow',
          'Righteous Judge', 'King of Kings', 'Lord of Hosts', 'Alpha and Omega', 'Beginning and End',
          'Shepherd of Souls', 'Bread of Life', 'Living Water', 'Way, Truth, Life', 'Resurrection Power',
          'Grace Abounding', 'Mercy Enduring', 'Love Unfailing', 'Victory Assured'
        ],
        themes: [
          'Soaring above life\'s challenges with God\'s strength', 'Finding strength in the Lord when you feel weak', 'Overcoming fear through God\'s presence', 'Experiencing God\'s mighty power in your life', 'Drawing from God\'s inexhaustible strength',
          'Recognizing God\'s holiness and majesty', 'Finding peace in the midst of chaos', 'Seeking divine wisdom and guidance', 'Trusting in God\'s unlimited power', 'Resting in God\'s eternal fatherhood',
          'Finding illumination in dark times', 'Taking shelter in God during life\'s storms', 'Experiencing God\'s healing touch', 'Finding renewed hope in God\'s promises', 'Receiving comfort in times of grief',
          'Trusting in God\'s perfect justice', 'Acknowledging God\'s supreme authority', 'Relying on God\'s military might', 'Understanding God\'s eternal nature', 'Recognizing God\'s complete sovereignty',
          'Following God\'s gentle guidance', 'Finding sustenance in God\'s word', 'Drinking from God\'s living water', 'Following God\'s path of truth', 'Experiencing God\'s resurrection power',
          'Receiving God\'s abundant grace', 'Trusting in God\'s enduring mercy', 'Resting in God\'s unfailing love', 'Confident in God\'s ultimate victory'
        ],
        verses: [
          'ISA.40.31', 'ISA.12.2', 'ISA.41.10', 'ISA.40.29', 'ISA.26.4',
          'ISA.1.4', 'ISA.9.6', 'ISA.9.6', 'ISA.9.6', 'ISA.9.6',
          'ISA.9.2', 'ISA.25.4', 'ISA.61.1', 'ISA.40.1', 'ISA.51.12',
          'ISA.33.22', 'ISA.6.5', 'ISA.6.3', 'ISA.44.6', 'ISA.48.12',
          'ISA.40.11', 'ISA.55.1', 'ISA.55.1', 'ISA.35.8', 'ISA.26.19',
          'ISA.55.7', 'ISA.54.8', 'ISA.54.10', 'ISA.25.8'
        ]
      }
    ];
  }

  // Get today's devotion from a custom reading plan
  async getTodaysDevotion(planId: string, bibleId?: string): Promise<DevotionDay | null> {
    // Use a simple counter that increments each time to simulate different days
    const now = new Date();
    const timeBasedIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % 5; // Changes every day
    
    // Custom manly devotional tracks using API.Bible scripture
    const devotionPlans = {
      'warrior-psalms': {
        verses: [
          'PSA.18.1-PSA.18.3', // Psalm 18:1-3 - Warrior's strength
          'PSA.27.1-PSA.27.3', // Psalm 27:1-3 - Courage
          'PSA.31.24',         // Psalm 31:24 - Be strong
          'PSA.46.1-PSA.46.3', // Psalm 46:1-3 - God our refuge
          'PSA.91.1-PSA.91.4'  // Psalm 91:1-4 - Protection
        ],
        titles: [
          'The Warrior\'s Strength',
          'Courage in Battle',
          'Stand Strong',
          'God Our Fortress',
          'Divine Protection'
        ],
        themes: [
          'Finding strength in God during spiritual battles',
          'Courage to face life\'s challenges with faith',
          'Standing firm in your convictions',
          'Trusting God as your ultimate refuge',
          'Resting in God\'s protection and care'
        ]
      },
      'leadership-proverbs': {
        verses: [
          'PRO.16.9',          // Proverbs 16:9 - Planning
          'PRO.27.17',         // Proverbs 27:17 - Iron sharpens iron
          'PRO.29.18',         // Proverbs 29:18 - Vision
          'PRO.31.8-PRO.31.9', // Proverbs 31:8-9 - Speak up
          'PRO.14.23'          // Proverbs 14:23 - Work
        ],
        titles: [
          'Divine Planning',
          'Iron Sharpens Iron',
          'Vision & Leadership',
          'Speak Up for Justice',
          'Diligent Work'
        ],
        themes: [
          'Planning your path while trusting God\'s direction',
          'The importance of godly friendships and accountability',
          'Leading with vision and purpose',
          'Using your voice to defend the vulnerable',
          'The value of hard work and diligence'
        ]
      },
      'courage-joshua': {
        verses: [
          'JOS.1.9',           // Joshua 1:9 - Be strong and courageous
          'JOS.1.6',           // Joshua 1:6 - Be strong and courageous
          'JOS.1.7',           // Joshua 1:7 - Be strong and very courageous
          'JOS.1.8',           // Joshua 1:8 - Keep this Book of the Law
          'JOS.1.5'            // Joshua 1:5 - I will never leave you
        ],
        titles: [
          'Be Strong and Courageous',
          'God\'s Command to Joshua',
          'Very Courageous',
          'Meditate on God\'s Word',
          'God\'s Promise'
        ],
        themes: [
          'God\'s command to be strong and courageous in all circumstances',
          'The foundation of courage is trust in God\'s presence',
          'Courage comes from obedience to God\'s commands',
          'Strength comes from meditating on God\'s Word',
          'God\'s promise to never leave or forsake us'
        ]
      },
      'strength-isaiah': {
        verses: [
          'ISA.40.31',         // Isaiah 40:31 - Those who hope in the Lord
          'ISA.41.10',         // Isaiah 41:10 - Do not fear
          'ISA.43.2',          // Isaiah 43:2 - When you pass through waters
          'ISA.54.17',         // Isaiah 54:17 - No weapon formed against you
          'ISA.26.3'           // Isaiah 26:3 - Perfect peace
        ],
        titles: [
          'Renewed Strength',
          'Do Not Fear',
          'Through the Waters',
          'No Weapon Formed',
          'Perfect Peace'
        ],
        themes: [
          'Those who hope in the Lord will renew their strength',
          'God\'s command to not fear because He is with us',
          'God\'s promise to be with us through trials',
          'No weapon formed against us will prosper',
          'Perfect peace comes from trusting in God'
        ]
      }
    };

    const plan = devotionPlans[planId as keyof typeof devotionPlans];
    if (!plan) return null;

    const dayIndex = timeBasedIndex % plan.verses.length;
    const verseId = plan.verses[dayIndex];
    
    // Use the selected Bible version or default to ESV
    const selectedBibleId = bibleId || this.defaultBibleId;
    const verse = await this.getVerse(selectedBibleId, verseId);
    if (!verse) return null;

    return {
      date: now.toISOString().split('T')[0],
      verses: [verse],
      title: plan.titles[dayIndex],
      content: plan.themes[dayIndex]
    };
  }



  // Clean HTML content from API.Bible response
  private cleanHtmlContent(htmlContent: string): string {
    if (!htmlContent) return '';
    
    // Remove HTML tags and clean up the content
    let cleaned = htmlContent
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up verse numbers and formatting
      .replace(/\d+\s*/g, '')
      // Add spaces between sentences/verses
      .replace(/\.([A-Z])/g, '. $1')
      // Remove extra whitespace and normalize
      .replace(/\s+/g, ' ')
      .trim();
    
    // If the content is too short or empty, return the original
    if (cleaned.length < 10) {
      return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
    
    return cleaned;
  }
}

export const bibleService = new BibleService();
