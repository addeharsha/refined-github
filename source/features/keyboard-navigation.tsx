import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	select.exists('.minimized-comment:not(.d-none)', comment) ||
	Boolean(comment.closest(`
		.js-resolvable-thread-contents.d-none,
		.js-resolvable-timeline-thread-container:not([open])
	`));

function runShortcuts(event: KeyboardEvent): void {
	if (isEditable(event.target)) {
		return;
	}

	const focusedComment = select(':target')!;

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select
			.all([
				// Files in diffs
				'.js-targetable-element[id^="diff-"]',
				// Comments (to be `.filter()`ed)
				'.js-minimizable-comment-group'
			])
			.filter(element =>
				element.classList.contains('js-minimizable-comment-group') ?
					!isCommentGroupMinimized(element) :
					true
			);

		// `j` goes to the next comment, `k` goes back a comment
		const direction = event.key === 'j' ? 1 : -1;

		const currentIndex = items.indexOf(focusedComment);

		// Start at 0 if nothing is; clamp index
		const chosenCommentIndex = Math.min(
			Math.max(0, currentIndex + direction),
			items.length - 1
		);

		if (currentIndex !== chosenCommentIndex) {
			// Focus comment without pushing to history
			location.replace('#' + items[chosenCommentIndex].id);
		}
	}
}

function init(): void {
	document.addEventListener('keypress', runShortcuts);
}

void features.add({
	id: __filebasename,
	description: 'Adds shortcuts to conversations and PR file lists: `j` focuses the comment/file below; `k` focuses the comment/file above.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/86573176-48665900-bf74-11ea-8996-a5c46cb7bdfd.gif',
	shortcuts: {
		j: 'Focus the comment/file below',
		k: 'Focus the comment/file above'
	}
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
