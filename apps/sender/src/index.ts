import { mock } from './mock.js';

const isMock = process.env.MOCK === 'true';

if (isMock) {
	mock();
} else {
	console.error('Unimplemented!');
	process.exit(1);
}
