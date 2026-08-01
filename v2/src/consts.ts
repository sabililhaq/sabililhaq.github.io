// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Sabililhaq';
export const SITE_DESCRIPTION =
	'Computer science graduate with deep interest in Software Engineering and Data. Passionate about coding, competitive programming, and writing about tech.';
export const SITE_AUTHOR = 'Sabililhaq';
export const SITE_SHORT_NAME = 'Sabililhaq';
export const EMAIL = 'sabililhaq.furqony@gmail.com';


export const SOCIALS = {
	linkedin: 'https://www.linkedin.com/in/sabililhaq/',
	github: 'https://github.com/sabililhaq',
	medium: 'https://sabililhaq.medium.com/',
	email: `mailto:${EMAIL}`,
	hackerrank: 'https://www.hackerrank.com/sabililhaqq',
	leetcode: 'https://leetcode.com/sabililhaq/',
} as const;

export type Project = {
	id: string;
	title: string;
	overview: string[];
	techStack: string;
	image: string;
	imageAlt: string;
	liveDemo?: string;
	sourceCode?: string;
};

export const PROJECTS: Project[] = [
	{
		id: 'travelokaocr',
		title: 'TravelokaOCR',
		overview: [
			"Building mobile apps to scan user's ID (KTP) for faster administration (KYC). Implementing computer vision machine learning algorithm, OCR (Optical Character Recognition).",
			'Google Bangkit Academy 2022 company-based capstone project, hosted by Traveloka.',
		],
		techStack: 'TensorFlow · GCP · Kotlin · Firebase · PostgreSQL',
		image: '/images/travelokaocr.jpg',
		imageAlt: 'TravelokaOCR project',
		liveDemo: 'https://capstone-bangkit-c22-ky01.github.io/traveloka-ocr-landingpage/',
	},
	{
		id: 'dass-analytics',
		title: 'DASS Analytics',
		overview: [
			"Website-based application to predict a person's level of Depression, Anxiety, and Stress.",
			'Building machine learning models based on the DASS public dataset as a data science course final project, including data dashboarding.',
		],
		techStack: 'Python · Scikit-learn · Streamlit',
		image: '/images/dass.jpg',
		imageAlt: 'DASS Analytics project',
		liveDemo: 'https://stressanalyticsapp.herokuapp.com/',
		sourceCode: 'https://github.com/Erland366/Streamlit-Stress-Analytics',
	},
	{
		id: 'nguli-id',
		title: 'Nguli.id',
		overview: [
			'Website-based marketplace connecting construction workers and foremen.',
		],
		techStack: 'PHP · Laravel · MySQL · Bootstrap',
		image: '/images/nguli.png',
		imageAlt: 'Nguli.id project',
		sourceCode: 'https://github.com/sabililhaq/aplikasi_kuli',
	},
];

export type SkillGroup = {
	label: string;
	items: { name: string; icon: string }[];
};

export const SKILLS: SkillGroup[] = [
	{
		label: 'Programming Languages',
		items: [
			{ name: 'Python', icon: '/images/skills/python.svg' },
			{ name: 'Java', icon: '/images/skills/java.svg' },
			{ name: 'JavaScript', icon: '/images/skills/js.svg' },
			{ name: 'PHP', icon: '/images/skills/php.svg' },
		],
	},
	{
		label: 'Technologies',
		items: [
			{ name: 'Node.js', icon: '/images/skills/node.svg' },
			{ name: 'TensorFlow', icon: '/images/skills/tensorflow.svg' },
			{ name: 'MySQL', icon: '/images/skills/mysql.svg' },
			{ name: 'Go', icon: '/images/skills/golang.svg' },
			{ name: 'Kotlin', icon: '/images/skills/kotlin.svg' },
			{ name: 'Laravel', icon: '/images/skills/laravel.png' },
			{ name: 'R', icon: '/images/skills/r.png' },
		],
	},
	{
		label: 'Others',
		items: [
			{ name: 'Tableau', icon: '/images/skills/tableau.svg' },
			{ name: 'Docker', icon: '/images/skills/docker.svg' },
			{ name: 'AWS', icon: '/images/skills/aws.svg' },
			{ name: 'HTML', icon: '/images/skills/html.svg' },
		],
	},
];
