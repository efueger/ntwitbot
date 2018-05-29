/**
 * NTwitBot - process.js
 * @file Tweet data processor.
 * @author Jordan Sne <jordansne@gmail.com>
 * @license MIT
 */

const entities = require('html-entities').AllHtmlEntities;
const Utils    = require('./utils.js');

/**
 * Tweet processor class. Processes new tweet data & saves it in the database.
 */
module.exports = class Process {

    /**
     * Process tracked tweets of the bot and returns the data.
     * @param {Array} tweets - The array of tweets in strings to be processed.
     * @return {Object} The processed tweet data.
     */
    processTweets(tweets) {
        const newData = {};

        Utils.log('Processing ' + tweets.length + ' new tweets');

        // Process tweets
        for (let i = 0; i < tweets.length; i++) {
            const tweet = tweets[i];
            // Process "< > &" symbols
            tweet.text = entities.decode(tweet.text);

            const filteredWords = this.filterWords(tweet.text.split(' '));
            if (filteredWords.length >= 3) {
                this.convertToLowercase(filteredWords);
                this.capitalizeSentences(filteredWords);
                this.appendPeriod(filteredWords);

                this.appendData(newData, filteredWords);
            }
        }

        return newData;
    }

    /**
     * Appends words to the data object. Edits the data object by reference.
     * @private
     * @param {Object} data - The object of tweet data.
     * @param {Array} words - An array of words to be added the data object.
     */
    appendData(data, words) {
        for (let i = 0; i < words.length - 2; i++) {
            const key = words[i] + ' ' + words[i + 1];

            if (!(key in data)) {
                // Create a new array for the word pair
                data[key] = [{
                    word: words[i + 2],
                    time: Utils.getTime()
                }];
            } else {
                // Append to the existing word pair
                data[key].push({
                    word: words[i + 2],
                    time: Utils.getTime()
                });
            }
        }
    }

    /**
     * Removes usernames and links from an array of words.
     * @private
     * @param {Array} words - The array of words to filter through.
     * @return {Array} The array after removing the filtered words.
     */
    filterWords(words) {
        const filteredWords = [];

        for (let i = 0; i < words.length; i++) {
            let word = words[i];

            if (!(word.startsWith('@') || word.startsWith('http'))) {
                filteredWords.push(word);
            }
        }

        return filteredWords;
    }

    /**
     * Converts all words to lowercase. Edits the words array by reference.
     * @private
     * @param {Array} words - The array of words to convert to lowercase
     */
    convertToLowercase(words) {
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].toLowerCase();
        }
    }

    /**
     * Capitalizes beginning of tweet and senetences. Edits the words array by reference.
     * @private
     * @param {Array} words - The array of words to capitalize.
     */
    capitalizeSentences(words) {
        // Capitalize the first word
        words[0] = Utils.capitalize(words[0]);

        // Capitalize any words after a sentence
        for (let i = 1; i < words.length; i++) {
            if (Utils.endsWithPunc(words[i - 1])) {
                words[i] = Utils.capitalize(words[i]);
            }
        }
    }

    /**
     * Appends a period to the end of tweet if not present. Edits the words array by reference.
     * @private
     * @param {Array} words - The array of words to append to.
     */
    appendPeriod(words) {
        let lastWord = words[words.length - 1];

        if (!Utils.endsWithPunc(lastWord) && !lastWord.endsWith(',')) {
            words[words.length - 1] += '.';
        }
    }

};
