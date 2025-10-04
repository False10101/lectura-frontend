const quizQuestions = [
  {
    id: 1,
    question: "When someone gives you directions to a new place, you’d prefer to:",
    options: [
      { text: "Look at a map or picture of the route", weights: { V: 5 } },
      { text: "Hear someone explain the way out loud", weights: { A: 5 } },
      { text: "Read the steps written down", weights: { R: 5 } },
      { text: "Walk or try the route yourself", weights: { K: 5 } },
    ],
  },
  {
    id: 2,
    question: "When you are preparing for an exam, your favorite way to study is:",
    options: [
      { text: "Reviewing charts, diagrams, or slides", weights: { V: 5 } },
      { text: "Talking with a classmate or recording yourself explaining", weights: { A: 5 } },
      { text: "Writing summaries and reading notes", weights: { R: 5 } },
      { text: "Solving practice problems or using examples", weights: { K: 5 } },
    ],
  },
  {
    id: 3,
    question: "When you are cooking a new recipe for a family treat, you’d prefer to:",
    options: [
      { text: "Ask a friend to explain how to cook it", weights: { A: 5 } },
      { text: "Follow the written recipe step by step", weights: { R: 5 } },
      { text: "Try cooking it and learn as you go", weights: { K: 5 } },
      { text: "See pictures of the finished dish and cook from experience", weights: { V: 5 } },
    ],
  },
  {
    id: 4,
    question: "When introduced to new people, you remember their names best if:",
    options: [
      { text: "You see their name written down or on a badge", weights: { V: 5 } },
      { text: "You hear them say their name clearly a few times", weights: { A: 5 } },
      { text: "You write their name down somewhere", weights: { R: 5 } },
      { text: "You associate their name with shaking hands or physical presence", weights: { K: 5 } },
    ],
  },
  {
    id: 5,
    question: "When buying new equipment (e.g., phone, laptop), your decision is influenced by:",
    options: [
      { text: "Comparison charts, pictures of models", weights: { V: 5 } },
      { text: "Talking to sales staff or friends about their opinions", weights: { A: 5 } },
      { text: "Reading specifications and reviews online", weights: { R: 5 } },
      { text: "Testing the device in the store yourself", weights: { K: 5 } },
    ],
  },
  {
    id: 6,
    question: "When working with teammates in group projects, you like to:",
    options: [
      { text: "Use whiteboards, sticky notes, or diagrams", weights: { V: 5 } },
      { text: "Have brainstorming talks and discussions", weights: { A: 5 } },
      { text: "Share and read written plans or documents", weights: { R: 5 } },
      { text: "Do hands-on activities together, like building or trying things out", weights: { K: 5 } },
    ],
  },
  {
    id: 7,
    question: "When browsing new websites, you like websites that have:",
    options: [
      { text: "Attractive design and visual features", weights: { V: 5 } },
      { text: "Audio channels where you can hear music, radio programs or interviews", weights: { A: 5 } },
      { text: "Interesting written descriptions, lists and explanations", weights: { R: 5 } },
      { text: "Things you can click on, shift or try", weights: { K: 5 } },
    ],
  },
  {
    id: 8,
    question: "You are going to choose food at a restaurant or cafe. You would:",
    options: [
      { text: "Pick a dish you’ve eaten there before", weights: { K: 5 } },
      { text: "Listen to the waiter or ask friends to recommend choices", weights: { A: 5 } },
      { text: "Choose from the descriptions in the menu", weights: { R: 5 } },
      { text: "Look at what others are eating or look at pictures of each dish", weights: { V: 5 } },
    ],
  },
  {
    id: 9,
    question: "You prefer a presenter or a teacher who uses:",
    options: [
      { text: "Diagrams, charts, maps, or graphs", weights: { V: 5 } },
      { text: "Talks, group discussion, or guest speakers", weights: { A: 5 } },
      { text: "Handouts, books, or readings", weights: { R: 5 } },
      { text: "Demonstrations, models, or practical activities", weights: { K: 5 } },
    ],
  },
  {
    id: 10,
    question: "When getting feedback after a project or test, you’d understand it best if it came as:",
    options: [
      { text: "Pictures, graphs, or charts that show how you did", weights: { V: 5 } },
      { text: "Someone talking it through with you step by step", weights: { A: 5 } },
      { text: "A written summary or detailed notes you can read later", weights: { R: 5 } },
      { text: "Specific examples of what you did well and what needs fixing", weights: { K: 5 } },
    ],
  },
];

export default quizQuestions;
