$(function() {

	// vowels repeated for help
	var letters = 'AAABCDEEEFGHIIIJKLMNOOOPRSTUUUVWXYYYZ',
		testBoard = [
			'C', 'A', 'T', 'X', 'Y',
			'A', 'N', 'T', 'X', 'A',
			'T', 'R', 'E', 'E', 'O',
			'E', 'B', 'X', 'Y', 'R',
			'S', 'T', 'M', 'N', 'U'
		],
		theBoard,
		currentTimeout,
		timeCount = 120,
		boardWords = {};

	function makeBoard(root) {
		var letterList = [],
			letterLen = root * root,
			index;
		while (letterLen) {
			index = Math.floor(Math.random() * letters.length);
			letterList.push(letters[index]);
			letterLen = letterLen - 1;
		}
		return letterList;
	}

	function inTrie(data, full) {
		var currentDict = words,
			wordLen = data.length,
			i;
		for (i = 0; i < wordLen ; i++) {
			var currentLetter = data[i];
			if (currentDict[currentLetter]) {
				currentDict = currentDict[currentLetter]
			} else {
				return false;
			}
		}
		if (full) {
			if (currentDict[0]) {
				return true;
		    } else {
				return false;
			}
		} else {
			return true;
		}
	}


	function buildBoard(place, boardData) {
		var square = Math.sqrt(boardData.length),
			table = $('<table>'),
			row = $('<tr>');
		$.each(boardData, function(index, value) {
			var cell = $('<td>').text(value).addClass('' + index);
			row.append(cell);
			if (index !== 0 && ((index + 1) % square) === 0) {
				table.append(row);
				row = $('<tr>');
			}
		});
		table.append(row);
		place.append(table);
	}

	function activate(wordInput, choices) {
		wordInput.change(function() {
			var li = $('<li>').text($(this).val());
			choices.prepend(li);
			$(this).val('');
		});
	}

	function startHunt(board) {
		if (boardWords[board]) {
			return boardWords[board];
		} else {
			var foundWords = [];
			$.each(board, function(index, value) {
				hunt(board, [index], foundWords);
			});
			boardWords[board] = foundWords;
			return foundWords;
		}
	}

	function cleanUp(cell) {
		cell.removeClass('hit');
	}

	function neighbors(board, index, mask) {
		var indexes = [],
			boardLength = board.length,
			square = Math.sqrt(boardLength),
			currentNeighbors = [
				1,
				square + 1,
				square,
				square - 1,
				-1,
				-(square + 1),
				-square,
				-(square - 1)
			];

		if (mask === undefined) {
			mask = [];
		}

		// this is barely  noticeable so probably not worth it
		$.each(board, function(lindex, value) {
			if (mask.indexOf(lindex) !== -1) {
				var cell = $('.' + lindex);
				cell.addClass('hit');
				window.setTimeout(cleanUp, 125, cell);
			}
		});



		$.each(currentNeighbors, function(lindex, neighbor) {
			var localIndex = index + neighbor;
			if ((index % square === 0) &&
					([-(square + 1), -1, square - 1].indexOf(neighbor) !== -1)) {
				return 1;
			}
			if (((index + 1) % square === 0) &&
					([-(square - 1), 1, square + 1].indexOf(neighbor) !== -1)) {
				return 1;
			}

			if (mask.indexOf(localIndex) !== -1) {
				return 1;
			}
			if (localIndex < 0) {
				return 1;
			}
			if (localIndex > (boardLength - 1)) {
				return 1;
			}
			indexes.push(localIndex);
		});

		return indexes;
	}

	function isWord(board, currentWord) {
		var thisWord = makeWord(board, currentWord);
		return (thisWord.length > 2 && inTrie(thisWord, true));
	}

	function makeWord(board, currentWord) {
		var thisWord = '';
		$.each(currentWord, function(index, value) {
			thisWord = thisWord + board[value];
		});
		return thisWord.toLowerCase();
	}

	function startsWord(board, currentWord) {
		var thisWord = makeWord(board, currentWord);
		return inTrie(thisWord);
	}

	function hunt(board, currentWord, finds) {
		var neighborIndexes = neighbors(board, currentWord.slice(-1)[0],
				currentWord);
		$.each(neighborIndexes, function(index, candidate) {
			currentWord.push(candidate);
			if (isWord(board, currentWord)) {
				var word = makeWord(board, currentWord);
				if (finds.indexOf(word) === -1) {
					finds.push(word);
				}
			}
			if (startsWord(board, currentWord)) {
				hunt(board, currentWord, finds);
			}
			currentWord.pop();
		});
	}

	function checkList(choices, board) {
		var allWords = startHunt(board),
			score = 0,
			words = 0;
		choices.find('li').each(function(index, el) {
			var word = $(el).text(),
				wordLength = word.length,
				scorePlus;
			if (allWords.indexOf(word) !== -1) {
				if (wordLength < 3) {
					scorePlus = 0;
				} else if (wordLength < 5) {
					scorePlus = 1;
				} else if (wordLength === 5) {
					scorePlus = 2;
				} else if (wordLength === 6) {
					scorePlus = 3;
				} else if (wordLength === 7) {
					scorePlus = 5;
				} else if (wordLength > 7) {
					scorePlus = 11;
				}
				score = score + scorePlus;
				words = words + 1;
				$(el).addClass('good');
			} else {
				$(el).addClass('bad');
			}
			$('#game .timer').text('Score ' + score + ': '
					+ words + ' of ' + allWords.length + ' words.');
		});
	}

	function updateTimer(timeSlot, count, board) {
		if (count < 0) {
			window.clearTimeout(currentTimeout);
			console.log('done');
			$('#game input[name="word"]').attr('disabled', 'disabled');
			checkList($('#game .choices'), board);
			solveBoard($('#game .finds'), board);
		} else {
			timeSlot.text(count);
			if (count < 30) {
				timeSlot.addClass('warn');
			}
			currentTimeout = window.setTimeout(updateTimer,
					1000, timeSlot, --count, board);
		}
	}

	function solveBoard(output, board) {
		var foundWords = startHunt(board);
		$.each(foundWords, function(index, word) {
			var link = $('<a>')
				.attr({'href': 'http://google.com/search?q=define:' + word,
					'target': '_blank'})
				.text(word),
				li = $('<li>').append(link);
			output.append(li);
		});
	}

	theBoard = makeBoard(window.location.hash ?
			parseInt(window.location.hash.substring(1)) : 4);
	$('#game .board').addClass('blanked');
	buildBoard($('#game .board'), theBoard);
	activate($('#game input[name="word"]'), $('#game .choices'));
	$('#game input[name="start"]').click(function() {
		$(this).remove();
		$('#game .board').removeClass('blanked');
		$('#game input[name="solve"]').attr('disabled', 'disabled');
		updateTimer($('#game .timer'), timeCount, theBoard);
		$('#game input[name="word"]').focus();
		$('#game input[name="done"]').removeAttr('disabled').click(function() {
			$(this).remove();
			updateTimer($('#game .timer'), -1, theBoard);
		});
	});
	$('#game input[name="solve"]').click(function() {
		$('#game input[name="start"]').attr('disabled', 'disabled');
		$(this).remove();
		$('#game .board').removeClass('blanked');
		solveBoard($('#game .finds'), theBoard);
	});

});
