export const en = {
  common: {
    login: 'Log in',
    signup: 'Sign up',
    logout: 'Log out',
    email: 'Email address',
    password: 'Password',
    username: 'Username',
    welcomeBack: 'Welcome back',
    joinCommunity: 'Join the community',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccount: 'Create Account',
    save: 'Save',
    add: 'Add',
  },
  landing: {
    subtitle: 'The #1 App for Pet Playdates & Breeding',
    titlePart1: 'Find the ',
    titleGradient: 'Perfect Match',
    titlePart2: ' For Your Furry Friend.',
    description: 'Swipe right on potential playdates, connect with other pet owners locally, and build a community for your beloved companion.',
    cta: 'Create Pet Profile',
    features: {
      local: { title: 'Local Discovery', desc: 'Find pets nearby using our advanced geolocation and filtering system.' },
      chat: { title: 'Real-time Chat', desc: 'Instantly connect and plan playdates with other owners when you match.' },
      safe: { title: 'Safe & Secure', desc: 'Verified profiles and a robust reporting system keep our community safe.' }
    }
  },
  profile: {
    title: 'My Profile',
    setup: 'Setup your profile',
    fullName: 'Full Name',
    bio: 'Bio',
    saveProfile: 'Save Profile',
    myPets: 'My Pets',
    noPets: "You haven't added any pets yet.",
    addNewPet: 'Add New Pet',
    petName: 'Name',
    petBreed: 'Breed',
    petAge: 'Age',
    petGender: 'Gender',
    petMale: 'Male',
    petFemale: 'Female',
    petBio: 'Pet Bio',
    addPetBtn: 'Add Pet'
  },
  feed: {
    discover: 'Discover',
    noMorePets: 'No more pets nearby',
    noMoreDesc: "You've seen all the pets in your area. Come back later for more potential matches!",
    refresh: 'Refresh',
    itsAMatch: "It's a Match!",
    youAnd: 'You and',
    likedEachOther: 'liked each other.',
    sendMessage: 'Send a Message',
    keepSwiping: 'Keep Swiping'
  },
  nav: {
    feed: 'Feed',
    matches: 'Matches',
    profile: 'Profile'
  },
  matches: {
    title: 'Your Matches',
    noMatches: "You don't have any matches yet. Keep swiping!",
    chat: 'Chat'
  },
  chat: {
    placeholder: 'Type a message...',
    send: 'Send'
  },
  admin: {
    title: 'Admin Dashboard',
    stats: 'Global Statistics',
    totalUsers: 'Total Users',
    totalPets: 'Total Pets',
    totalMatches: 'Total Matches',
    totalSwipes: 'Total Swipes',
    unauthorized: 'Unauthorized Access',
    backHome: 'Back to Home'
  },
  community: {
    title: 'Community',
    stats: 'Pets Nearby',
    events: 'Upcoming Events',
    join: 'Join',
    nearby: 'near you',
    lookingFor: 'Looking for a playmate for...',
    createPost: 'Post something',
    createEvent: 'Create Event',
    compatibility: 'Compatibility'
  }
}

export type Dictionary = typeof en
