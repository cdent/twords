# What

Messing around with [tsapp](http://tsapp.tiddlyspace.com) to create
a word finding game. See it in action at
[twords](http://twords.tiddlyspace.com/twords).

The code is mostly a straight port (with added UI) of an earlier
[gist in Python](https://gist.github.com/cdent/268079) to experiment
with a trie-like (but not actually a trie) data structure. That
structure worked very well for Python idioms but makes less sense in
a JavaScript context because it makes itself very large to support
easy queries. This is great when local, but less great when wanting
that data structure available in a browser. `words.js` is a 37M
file... With a `_cache-max-age` it's better but still needs to be
interpreted.

**Update**: Switching to a more formal trie gets the size down to
just under 7M. Still large but much better.

# Why

Cuz, why not?

To learn stuff.

# How

If you add a `#<some number>` arg to the
[URI](http://twords.tiddlyspace.com/twords#6) that number controls
the size of the square that makes up the game.

# Wrong

* Letter frequencies are not aligned with Boggle norms.
* The letter `Q` is not used at all, to make life easier.
* The dictionary (`web2`) is full of all kinds of bizarre words
  which are not legit.

# Next

If I get sufficiently motivated what it would be nice for this to do
is:

* Use a better data structure.
* Be pretty with lovely CSS etc.
* Be multi-player.

I think it ought to be possible to hack the websocket handling to:

* Use a tiddler which serializes a board to announce that that board
  is getting ready.
* Various listening clients hear that board and load it, counting
  down to a start.
* Upon completion each individual saves a tiddler with the
  serialized results of their game, with the title of the board, such
  that everyone else can `GET` and compare, also over the sockets.
* Some kind of tiddler cleanup would be done after the game is over.

# Who

[cdent](http://cdent.tiddlyspace.com)
