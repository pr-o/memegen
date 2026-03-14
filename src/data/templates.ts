export interface TextLayerDef {
  label: string;
  x: number;   // percentage of image width (0–1)
  y: number;   // percentage of image height (0–1)
  w: number;   // percentage of image width (0–1)
  h: number;   // percentage of image height (0–1)
  defaultText: string;
  style: {
    fontSize: number;
    fontFamily: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    align: 'left' | 'center' | 'right';
  };
}

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  src: string;
  width: number;
  height: number;
  textLayers: TextLayerDef[];
}

const defaultStyle: TextLayerDef['style'] = {
  fontSize: 36,
  fontFamily: 'Impact',
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 2,
  align: 'center',
};

export const templates: MemeTemplate[] = [
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    description: 'Drake disapproving vs approving something. Perfect for comparing two options.',
    src: '/templates/drake.jpg',
    width: 1200,
    height: 1200,
    textLayers: [
      {
        label: 'Top Text',
        x: 0.52, y: 0.05,
        w: 0.44, h: 0.4,
        defaultText: 'Text 1',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 32 },
      },
      {
        label: 'Bottom Text',
        x: 0.52, y: 0.55,
        w: 0.44, h: 0.4,
        defaultText: 'Text 2',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 32 },
      },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    description: 'A stressed person sweating over two button choices. Great for impossible decisions.',
    src: '/templates/two-buttons.jpg',
    width: 600,
    height: 908,
    textLayers: [
      {
        label: 'Button 1',
        x: 0.05, y: 0.05,
        w: 0.38, h: 0.18,
        defaultText: 'Text 1',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 28 },
      },
      {
        label: 'Button 2',
        x: 0.55, y: 0.05,
        w: 0.38, h: 0.18,
        defaultText: 'Text 2',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 28 },
      },
      {
        label: 'Bottom Text',
        x: 0.05, y: 0.8,
        w: 0.9, h: 0.15,
        defaultText: 'Text 3',
        style: { ...defaultStyle, fontSize: 32 },
      },
    ],
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    description: 'Guy checking out another woman while his girlfriend looks on. Classic "temptation" meme.',
    src: '/templates/distracted-boyfriend.jpg',
    width: 1200,
    height: 800,
    textLayers: [
      {
        label: 'Girlfriend',
        x: 0.0, y: 0.55,
        w: 0.25, h: 0.35,
        defaultText: 'Girlfriend',
        style: { ...defaultStyle, fontSize: 28 },
      },
      {
        label: 'Boyfriend',
        x: 0.3, y: 0.55,
        w: 0.3, h: 0.35,
        defaultText: 'Boyfriend',
        style: { ...defaultStyle, fontSize: 28 },
      },
      {
        label: 'Other Woman',
        x: 0.68, y: 0.55,
        w: 0.3, h: 0.35,
        defaultText: 'Other Woman',
        style: { ...defaultStyle, fontSize: 28 },
      },
    ],
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    description: 'Steven Crowder sitting at a table with a sign. Use it to make a bold, controversial statement.',
    src: '/templates/change-my-mind.jpg',
    width: 482,
    height: 361,
    textLayers: [
      {
        label: 'Sign Text',
        x: 0.35, y: 0.45,
        w: 0.6, h: 0.3,
        defaultText: 'Your opinion here.\nChange my mind.',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 22 },
      },
    ],
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    description: 'A dog sitting calmly in a burning room. Perfect for describing chaotic situations.',
    src: '/templates/this-is-fine.jpg',
    width: 580,
    height: 282,
    textLayers: [
      {
        label: 'Text',
        x: 0.05, y: 0.05,
        w: 0.5, h: 0.3,
        defaultText: 'This is fine.',
        style: { ...defaultStyle, fontSize: 28 },
      },
    ],
  },
  {
    id: 'one-does-not-simply',
    name: 'One Does Not Simply',
    description: 'Boromir from Lord of the Rings. The classic "one does not simply..." format.',
    src: '/templates/one-does-not-simply.jpg',
    width: 568,
    height: 335,
    textLayers: [
      {
        label: 'Top Text',
        x: 0.05, y: 0.02,
        w: 0.9, h: 0.25,
        defaultText: 'ONE DOES NOT SIMPLY',
        style: { ...defaultStyle, fontSize: 30 },
      },
      {
        label: 'Bottom Text',
        x: 0.05, y: 0.72,
        w: 0.9, h: 0.25,
        defaultText: 'WALK INTO MORDOR',
        style: { ...defaultStyle, fontSize: 30 },
      },
    ],
  },
  {
    id: 'batman-slapping-robin',
    name: 'Batman Slapping Robin',
    description: 'Batman slapping Robin mid-sentence. Great for shutting down bad takes.',
    src: '/templates/batman-slapping-robin.jpg',
    width: 400,
    height: 387,
    textLayers: [
      {
        label: 'Robin (Top)',
        x: 0.52, y: 0.02,
        w: 0.45, h: 0.35,
        defaultText: 'But I was just—',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 22 },
      },
      {
        label: 'Batman (Bottom)',
        x: 0.03, y: 0.55,
        w: 0.45, h: 0.35,
        defaultText: 'WRONG',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 24 },
      },
    ],
  },
  {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    description: 'A woman yelling at a confused-looking cat at a dinner table. Classic reaction meme.',
    src: '/templates/woman-yelling-at-cat.jpg',
    width: 680,
    height: 438,
    textLayers: [
      {
        label: 'Woman (Left)',
        x: 0.02, y: 0.6,
        w: 0.45, h: 0.35,
        defaultText: 'YOU',
        style: { ...defaultStyle, fontSize: 30 },
      },
      {
        label: 'Cat (Right)',
        x: 0.52, y: 0.6,
        w: 0.45, h: 0.35,
        defaultText: 'ME',
        style: { ...defaultStyle, fill: '#000000', stroke: '#ffffff', strokeWidth: 1, fontSize: 30 },
      },
    ],
  },
];
