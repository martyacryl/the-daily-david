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
    // We can create our own marriage-focused devotional tracks using their scripture API
    return [
      {
        id: 'marriage-foundation',
        name: 'Marriage Foundation',
        description: '30 days of scripture focused on building a strong marriage foundation',
        duration: 30,
        titles: [
          'Two Become One', 'Love is Patient', 'Honor Your Spouse', 'Submit to One Another', 'Forgive as Christ Forgave',
          'Bear Each Other\'s Burdens', 'Rejoice Together', 'Weep Together', 'Live in Harmony', 'Be Kind and Compassionate',
          'Speak Truth in Love', 'Build Each Other Up', 'Encourage One Another', 'Pray Together', 'Seek God First',
          'Trust in the Lord', 'Delight in Each Other', 'Cherish Your Spouse', 'Respect One Another', 'Serve Each Other',
          'Be Quick to Listen', 'Slow to Anger', 'Abound in Love', 'Walk in Unity', 'Glorify God Together',
          'Bear Fruit Together', 'Grow in Grace', 'Endure Together', 'Hope in Christ', 'Love Never Fails'
        ],
        themes: [
          'The biblical foundation of marriage as two becoming one', 'The patience required in loving your spouse daily', 'Honoring your spouse as a gift from God', 'Mutual submission as the key to harmony', 'Forgiveness as the cornerstone of lasting love',
          'Carrying each other\'s burdens with grace and compassion', 'Celebrating victories and joys together', 'Supporting each other through difficult times', 'Living in unity despite differences', 'Showing kindness in words and actions',
          'Speaking truth with love and gentleness', 'Building up rather than tearing down', 'Encouraging each other\'s dreams and goals', 'Praying together for your marriage and family', 'Putting God at the center of your relationship',
          'Trusting God with your marriage and future', 'Finding joy and delight in your spouse', 'Cherishing your spouse as a precious gift', 'Showing respect in all circumstances', 'Serving each other with love and humility',
          'Listening with an open heart and mind', 'Controlling anger and choosing peace', 'Allowing love to grow and flourish', 'Walking together in unity and purpose', 'Glorifying God through your marriage',
          'Bearing spiritual fruit together', 'Growing in God\'s grace as a couple', 'Enduring trials and challenges together', 'Placing your hope in Christ', 'Understanding that true love never fails'
        ],
        verses: [
          'GEN.2.24', '1CO.13.4', 'HEB.13.4', 'EPH.5.21', 'COL.3.13',
          'GAL.6.2', 'ROM.12.15', 'ROM.12.15', 'ROM.12.16', 'EPH.4.32',
          'EPH.4.15', '1TH.5.11', 'HEB.3.13', 'MAT.18.19', 'MAT.6.33',
          'PRO.3.5', 'PRO.5.18', 'EPH.5.28', 'EPH.5.33', 'GAL.5.13',
          'JAM.1.19', 'JAM.1.19', '1TH.3.12', 'PSA.133.1', '1CO.10.31',
          'JOH.15.8', '2PE.3.18', 'HEB.12.1', 'ROM.15.13', '1CO.13.8'
        ]
      },
      {
        id: 'love-languages',
        name: 'Love Languages in Scripture',
        description: 'Daily devotionals exploring the five love languages through biblical wisdom',
        duration: 35,
        titles: [
          'Words of Affirmation', 'Quality Time Together', 'Acts of Service', 'Physical Touch', 'Gifts of Love',
          'Speaking Life', 'Being Present', 'Serving with Joy', 'Gentle Touch', 'Thoughtful Gifts',
          'Encouraging Words', 'Undivided Attention', 'Helping Hands', 'Comforting Embrace', 'Meaningful Tokens',
          'Building Up', 'Creating Memories', 'Lightening Loads', 'Showing Affection', 'Celebrating Moments',
          'Positive Reinforcement', 'Focused Listening', 'Practical Help', 'Physical Comfort', 'Surprise Blessings',
          'Complimenting Character', 'Date Night Ideas', 'Household Chores', 'Hugs and Kisses', 'Special Occasions',
          'Praising Efforts', 'Deep Conversations', 'Running Errands', 'Holding Hands', 'Anniversary Gifts',
          'Acknowledging Growth', 'Shared Activities', 'Taking Initiative', 'Back Rubs', 'Love Notes'
        ],
        themes: [
          'Using words to build up and encourage your spouse', 'Making time for meaningful connection and conversation', 'Showing love through helpful actions and service', 'Expressing love through appropriate physical affection', 'Demonstrating love through thoughtful gifts and gestures',
          'Speaking life-giving words that inspire and motivate', 'Being fully present and engaged when together', 'Serving your spouse with a joyful and willing heart', 'Using gentle touch to comfort and connect', 'Giving gifts that show you know and care for your spouse',
          'Using encouraging words to support your spouse\'s dreams', 'Giving your spouse your undivided attention', 'Lightening your spouse\'s load through practical help', 'Providing physical comfort during difficult times', 'Giving meaningful tokens of your love and appreciation',
          'Building up your spouse\'s confidence and self-worth', 'Creating special memories together', 'Taking on tasks to make your spouse\'s life easier', 'Showing physical affection regularly', 'Celebrating special moments and milestones',
          'Using positive reinforcement to encourage good habits', 'Practicing focused listening without distractions', 'Offering practical help with daily tasks', 'Providing physical comfort and reassurance', 'Surprising your spouse with unexpected blessings',
          'Complimenting your spouse\'s character and virtues', 'Planning special date nights and activities', 'Taking care of household responsibilities', 'Using hugs and kisses to express love', 'Remembering and celebrating special occasions',
          'Praising your spouse\'s efforts and achievements', 'Engaging in deep, meaningful conversations', 'Running errands to help your spouse', 'Holding hands as a sign of connection', 'Giving thoughtful anniversary gifts',
          'Acknowledging your spouse\'s personal growth', 'Participating in activities your spouse enjoys', 'Taking initiative to help without being asked', 'Giving relaxing back rubs and massages', 'Writing love notes and letters'
        ],
        verses: [
          'PRO.16.24', 'ECC.4.9-12', 'GAL.5.13', 'SON.2.6', 'MAT.7.11',
          'PRO.18.21', 'PSA.46.10', 'COL.3.23', 'ISA.40.11', 'JAM.1.17',
          '1TH.5.11', 'JAM.1.19', 'GAL.6.2', 'ISA.66.13', 'PSA.68.19',
          'EPH.4.29', 'PSA.133.1', 'PHI.2.4', 'SON.8.3', 'PSA.118.24',
          'PRO.12.25', 'JAM.1.19', 'ROM.12.10', 'ISA.40.11', 'LUK.6.38',
          'PRO.31.28', 'SON.7.12', 'TIT.2.5', 'SON.1.2', 'PSA.20.4',
          'PRO.31.31', 'PRO.20.5', 'ROM.12.13', 'SON.2.16', 'PSA.45.11',
          'PRO.27.17', 'ECC.4.9', 'PHI.2.4', 'SON.8.6', 'PSA.103.2'
        ]
      },
      {
        id: 'communication-couples',
        name: 'Communication for Couples',
        description: 'Biblical wisdom for healthy communication in marriage',
        duration: 28,
        titles: [
          'Listen Before Speaking', 'Speak Truth in Love', 'Be Quick to Listen', 'Slow to Anger', 'Avoid Harsh Words',
          'Use Gentle Answers', 'Seek Understanding', 'Avoid Quarrels', 'Be Patient', 'Choose Your Words Wisely',
          'Don\'t Let the Sun Go Down', 'Forgive Quickly', 'Seek Peace', 'Be Humble', 'Show Respect',
          'Avoid Gossip', 'Build Up Don\'t Tear Down', 'Be Honest', 'Show Kindness', 'Be Encouraging',
          'Avoid Sarcasm', 'Be Direct', 'Show Appreciation', 'Be Gracious', 'Seek Reconciliation',
          'Avoid Criticism', 'Be Supportive', 'Show Empathy', 'Be Forgiving', 'Speak Life'
        ],
        themes: [
          'The importance of listening before responding in marriage', 'Speaking truth with love and gentleness', 'Being quick to listen and slow to speak', 'Controlling anger and choosing patience', 'Avoiding harsh words that wound the heart',
          'Using gentle answers to turn away wrath', 'Seeking to understand before being understood', 'Avoiding unnecessary quarrels and arguments', 'Practicing patience in difficult conversations', 'Choosing words that build up rather than tear down',
          'Resolving conflicts before the day ends', 'Forgiving quickly and completely', 'Seeking peace and harmony in your relationship', 'Approaching conversations with humility', 'Showing respect even in disagreement',
          'Avoiding gossip and harmful speech', 'Building up your spouse with your words', 'Being honest while remaining loving', 'Showing kindness in all communication', 'Being encouraging and supportive',
          'Avoiding sarcasm and hurtful humor', 'Being direct and clear in your communication', 'Showing appreciation for your spouse', 'Being gracious in your responses', 'Seeking reconciliation and healing',
          'Avoiding constant criticism and negativity', 'Being supportive of your spouse\'s dreams', 'Showing empathy and understanding', 'Being quick to forgive and forget', 'Speaking words that bring life and hope'
        ],
        verses: [
          'JAM.1.19', 'EPH.4.15', 'JAM.1.19', 'JAM.1.19', 'COL.3.8',
          'PRO.15.1', 'PRO.18.2', 'PRO.17.14', '1CO.13.4', 'COL.4.6',
          'EPH.4.26', 'COL.3.13', 'ROM.12.18', 'PHI.2.3', 'EPH.5.33',
          'LEV.19.16', '1TH.5.11', 'EPH.4.25', 'COL.3.12', 'HEB.3.13',
          'PRO.26.18', 'MAT.5.37', '1TH.5.18', 'COL.4.6', 'MAT.5.24',
          'PRO.21.19', 'GAL.6.2', 'ROM.12.15', 'EPH.4.32', 'PRO.18.21'
        ]
      },
      {
        id: 'parenting-together',
        name: 'Parenting Together',
        description: 'Biblical principles for raising children as a united couple',
        duration: 40,
        titles: [
          'Train Up a Child', 'Discipline with Love', 'Teach God\'s Ways', 'Be Consistent', 'Pray for Your Children',
          'Lead by Example', 'Show Unconditional Love', 'Set Boundaries', 'Encourage Growth', 'Be Patient',
          'Teach Respect', 'Model Forgiveness', 'Celebrate Progress', 'Correct with Grace', 'Build Character',
          'Create Memories', 'Share Responsibilities', 'Support Each Other', 'Seek Wisdom', 'Trust God',
          'Be United', 'Show Affection', 'Teach Values', 'Encourage Dreams', 'Provide Security',
          'Be Present', 'Listen Well', 'Guide Gently', 'Celebrate Uniqueness', 'Build Confidence',
          'Teach Responsibility', 'Model Integrity', 'Encourage Faith', 'Show Compassion', 'Be Encouraging',
          'Create Traditions', 'Share Stories', 'Teach Gratitude', 'Model Service', 'Build Legacy'
        ],
        themes: [
          'Training children in the way they should go according to God\'s word', 'Disciplining children with love and consistency', 'Teaching children about God\'s ways and commandments', 'Being consistent in your parenting approach', 'Praying regularly for your children\'s well-being',
          'Leading by example in your own behavior and choices', 'Showing unconditional love even during difficult times', 'Setting clear and appropriate boundaries', 'Encouraging your children\'s growth and development', 'Being patient with your children\'s learning process',
          'Teaching children to respect others and authority', 'Modeling forgiveness and reconciliation', 'Celebrating your children\'s progress and achievements', 'Correcting with grace and understanding', 'Building strong character in your children',
          'Creating meaningful memories and traditions', 'Sharing parenting responsibilities equally', 'Supporting each other in parenting decisions', 'Seeking God\'s wisdom in difficult situations', 'Trusting God with your children\'s future',
          'Being united in your parenting approach', 'Showing affection and love to your children', 'Teaching important values and principles', 'Encouraging your children\'s dreams and aspirations', 'Providing a secure and stable home environment',
          'Being present and engaged in your children\'s lives', 'Listening to your children with patience and understanding', 'Guiding your children gently and lovingly', 'Celebrating each child\'s unique gifts and talents', 'Building your children\'s confidence and self-worth',
          'Teaching children to be responsible and accountable', 'Modeling integrity and honesty in all situations', 'Encouraging your children\'s faith and spiritual growth', 'Showing compassion and empathy to others', 'Being encouraging and supportive of your children',
          'Creating family traditions and rituals', 'Sharing stories and experiences with your children', 'Teaching children to be grateful and appreciative', 'Modeling service and helping others', 'Building a legacy of faith and love for future generations'
        ],
        verses: [
          'PRO.22.6', 'HEB.12.6', 'DEU.6.7', 'EPH.6.4', 'JAM.5.16',
          '1CO.11.1', 'JOH.3.16', 'PRO.29.17', '1TH.5.11', '1CO.13.4',
          'EPH.6.2', 'COL.3.13', 'PSA.127.3', 'PRO.15.1', 'PRO.22.6',
          'PSA.78.4', 'GAL.6.2', 'PRO.31.28', 'JAM.1.5', 'PSA.127.3',
          'AMO.3.3', 'SON.8.6', 'DEU.6.7', 'JER.29.11', 'PSA.91.1',
          'PSA.127.3', 'JAM.1.19', 'ISA.40.11', 'PSA.139.14', 'PSA.139.14',
          'GAL.6.5', 'TIT.2.7', 'DEU.6.7', 'COL.3.12', '1TH.5.11',
          'DEU.6.7', 'PSA.78.4', '1TH.5.18', 'GAL.5.13', 'PSA.78.4'
        ]
      }
    ];
  }

  // Get today's devotion from a custom reading plan
  async getTodaysDevotion(planId: string, bibleId?: string, day?: number): Promise<DevotionDay | null> {
    const now = new Date();
    const timeBasedIndex = day !== undefined ? (day - 1) : Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) % 5;
    
    // Custom marriage-focused devotional tracks using API.Bible scripture
    const devotionPlans = {
      'marriage-foundation': {
        verses: [
          'GEN.2.24', '1CO.13.4', 'HEB.13.4', 'EPH.5.21', 'COL.3.13'
        ],
        titles: [
          'Two Become One',
          'Love is Patient',
          'Honor Your Spouse',
          'Submit to One Another',
          'Forgive as Christ Forgave'
        ],
        themes: [
          'The biblical foundation of marriage as two becoming one',
          'The patience required in loving your spouse daily',
          'Honoring your spouse as a gift from God',
          'Mutual submission as the key to harmony',
          'Forgiveness as the cornerstone of lasting love'
        ]
      },
      'love-languages': {
        verses: [
          'PRO.16.24', 'ECC.4.9-12', 'GAL.5.13', 'SON.2.6', 'MAT.7.11'
        ],
        titles: [
          'Words of Affirmation',
          'Quality Time Together',
          'Acts of Service',
          'Physical Touch',
          'Gifts of Love'
        ],
        themes: [
          'Using words to build up and encourage your spouse',
          'Making time for meaningful connection and conversation',
          'Showing love through helpful actions and service',
          'Expressing love through appropriate physical affection',
          'Demonstrating love through thoughtful gifts and gestures'
        ]
      },
      'communication-couples': {
        verses: [
          'JAM.1.19', 'EPH.4.15', 'JAM.1.19', 'JAM.1.19', 'COL.3.8'
        ],
        titles: [
          'Listen Before Speaking',
          'Speak Truth in Love',
          'Be Quick to Listen',
          'Slow to Anger',
          'Avoid Harsh Words'
        ],
        themes: [
          'The importance of listening before responding in marriage',
          'Speaking truth with love and gentleness',
          'Being quick to listen and slow to speak',
          'Controlling anger and choosing patience',
          'Avoiding harsh words that wound the heart'
        ]
      },
      'parenting-together': {
        verses: [
          'PRO.22.6', 'HEB.12.6', 'DEU.6.7', 'EPH.6.4', 'JAM.5.16'
        ],
        titles: [
          'Train Up a Child',
          'Discipline with Love',
          'Teach God\'s Ways',
          'Be Consistent',
          'Pray for Your Children'
        ],
        themes: [
          'Training children in the way they should go according to God\'s word',
          'Disciplining children with love and consistency',
          'Teaching children about God\'s ways and commandments',
          'Being consistent in your parenting approach',
          'Praying regularly for your children\'s well-being'
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
