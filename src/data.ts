import { Presentation } from './types';

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: 'song-1',
    title: 'Amazing Grace (My Chains Are Gone)',
    category: 'Song',
    copyright: '© 2006 worshiptogether.com Songs (Admin. by Capitol CMG Publishing)',
    slides: [
      {
        id: 's1-v1',
        label: 'Verse 1',
        text: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found\nWas blind, but now I see.',
        notes: 'Acoustic guitar and light vocals only.'
      },
      {
        id: 's1-ch',
        label: 'Chorus',
        text: 'My chains are gone, I\'ve been set free\nMy Savior, Ransom, has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace.',
        notes: 'Full band enters. Build-up on chorus.'
      },
      {
        id: 's1-v2',
        label: 'Verse 2',
        text: '\'Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed.',
        notes: 'Steady tambourine, rhythm guitar.'
      },
      {
        id: 's1-ch2',
        label: 'Chorus',
        text: 'My chains are gone, I\'ve been set free\nMy Savior, Ransom, has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace.',
        notes: 'Intense background vocals added.'
      },
      {
        id: 's1-v3',
        label: 'Verse 3',
        text: 'The Lord has promised good to me\nHis word my hope secures\nHe will my shield and portion be\nAs long as life endures.',
        notes: 'Drop down in volume, swelling pads.'
      },
      {
        id: 's1-ch3',
        label: 'Chorus (Double)',
        text: 'My chains are gone, I\'ve been set free\nMy Savior, Ransom, has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace.',
        notes: 'Fortissimo peak!'
      }
    ]
  },
  {
    id: 'song-2',
    title: '10,000 Reasons (Bless The Lord)',
    category: 'Song',
    copyright: '© 2011 Atlas Mountain Songs (Admin. by Capitol CMG Publishing)',
    slides: [
      {
        id: 's2-ch1',
        label: 'Chorus',
        text: 'Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI\'ll worship Your holy name.',
        notes: 'Start directly with the Chorus, organ swell.'
      },
      {
        id: 's2-v1',
        label: 'Verse 1',
        text: 'The sun comes up, it\'s a new day dawning\nIt\'s time to sing Your song again\nWhatever may pass, and whatever lies before me\nLet me be singing when the evening comes.',
        notes: 'Drums enter with light Rimshot.'
      },
      {
        id: 's2-ch2',
        label: 'Chorus',
        text: 'Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI\'ll worship Your holy name.',
        notes: 'Stronger beat, bass joins.'
      },
      {
        id: 's2-v2',
        label: 'Verse 2',
        text: 'You\'re rich in love, and You\'re slow to anger\nYour name is great, and Your heart is kind\nFor all Your goodness I will keep on singing\nTen thousand reasons for my heart to find.',
        notes: 'Piano leading, light backup harmonies.'
      },
      {
        id: 's2-ch3',
        label: 'Chorus',
        text: 'Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI\'ll worship Your holy name.',
        notes: 'Full driving rock rhythm.'
      }
    ]
  },
  {
    id: 'scripture-1',
    title: 'Psalm 23:1-4 (Shepherd\'s Care)',
    category: 'Scripture',
    copyright: 'Scriptures taken from Holy Bible, ESV®',
    slides: [
      {
        id: 'sc-1',
        label: 'Psalm 23:1',
        text: 'The LORD is my shepherd;\nI shall not want.',
        notes: 'Background: green pastures motion loop'
      },
      {
        id: 'sc-2',
        label: 'Psalm 23:2',
        text: 'He makes me lie down in green pastures.\nHe leads me beside still waters.',
        notes: 'Background: slow flowing water'
      },
      {
        id: 'sc-3',
        label: 'Psalm 23:3',
        text: 'He restores my soul.\nHe leads me in paths of righteousness\nfor his name\'s sake.',
        notes: 'Background: path in forest'
      },
      {
        id: 'sc-4',
        label: 'Psalm 23:4',
        text: 'Even though I walk through\nthe valley of the shadow of death,\nI will fear no evil,\nfor you are with me;\nyour rod and your staff, they comfort me.',
        notes: 'Change tone to deep warm low light'
      }
    ]
  },
  {
    id: 'announcements-1',
    title: 'Sunday Morning Updates',
    category: 'Announcements',
    slides: [
      {
        id: 'ann-1',
        label: 'Welcome',
        text: 'WELCOME TO LIVE ASSEMBLY\n\nWe\'re so glad you are worshipping with us!\nText "HELLO" to 555-0199 to connect.',
        notes: 'Play slide on pre-service countdown loop.'
      },
      {
        id: 'ann-2',
        label: 'Community Groups',
        text: 'FIND YOUR COMMUNITY\n\nMid-week home groups starting this September.\nSign up in the main lobby or on our app!',
        notes: 'Show QR code placeholder on screen.'
      },
      {
        id: 'ann-3',
        label: 'Youth Night',
        text: 'YOUTH NIGHT\n\nEvery Wednesday • 7:00 PM • Hall B\nFood, games, and authentic small groups.',
        notes: 'Upbeat dynamic background.'
      },
      {
        id: 'ann-4',
        label: 'Giving Notice',
        text: 'GENEROSITY CHANGES LIVES\n\nGive online at liveassembly.org/give\nOr put your envelope in the box by the exits.',
        notes: 'Quiet instrumental background playing.'
      }
    ]
  },
  {
    id: 'sermon-1',
    title: 'Sermon: Living with Purpose',
    category: 'Sermon',
    copyright: 'Speaker: Lead Pastor Jonathan Reed',
    slides: [
      {
        id: 'ser-1',
        label: 'Title Slide',
        text: 'LIVING WITH PURPOSE\n\nPastor Jonathan Reed\nEphesians Series: Part 4',
        notes: 'Keep on screen as pastor walks up.'
      },
      {
        id: 'ser-2',
        label: 'Ephesians 5:15-16',
        text: '"Look carefully then how you walk,\nnot as unwise but as wise, \nmaking the best use of the time, \nbecause the days are evil."',
        notes: 'Pastor will read verses slow. Prepare scriptures overlay.'
      },
      {
        id: 'ser-3',
        label: 'Key Point 1',
        text: '1. INTENTIONALITY\nbreeds faithfulness.\n\nOur days are limited; our calling is eternal.',
        notes: 'Ensure bold styling is legible.'
      },
      {
        id: 'ser-4',
        label: 'Key Point 2',
        text: '2. ENCOURAGEMENT\nsustains obedience.\n\nWe do not run this race alone.',
        notes: 'Sermon illustration slide.'
      }
    ]
  }
];


