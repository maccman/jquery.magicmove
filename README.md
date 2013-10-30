# Magic Move

Animations and transitions are fairly crucial to the look and feel of modern applications, and can be a good way of indicating to a user what their interactions are doing. Indeed, the best interfaces have been clued up on this for a while now -- pretty much every interaction you have with iOS involves an animation.

However animations can get convoluted really fast, especially if you have a lot of different states which require different transitions depending on which states are being entered or left. This is a problem I've struggled with in more complex UIs, specifically figuring out the position of elements - (we ended up using position absolute for everything, and having a huge amount of conditional code).

I've always wondered if there's a better way of doing transitions and, rather than hard coding positions, delegate layout to the browser. Inspired by Keynote's *Magic Move* effect, I've made a [little jQuery library](https://github.com/maccman/jquery.magicmove) to do transitions between DOM states.

    $('.containers').magicMove({
        easing: 'ease',
        duration: 300
      },
      function(){
        var $el = $('<section>Third</section>');
        $(this).find('.second').after($el);
      }
    );

The second argument to `$.fn.magicMove` is a callback, which gets executed in the context of whatever element you're transitioning. Simply manipulate the DOM, hide or show elements, add or remove classes, and the changes will be animated.

You can see an example of this in action [on GitHub](http://maccman.github.io/jquery.magicmove/), notice that we're not calculating any position information--the browser is doing that for us.

The library works by appending a separate and hidden clone of the element you're transitioning to the page. Any DOM manipulation you do is actually manipulating that clone. Then, when you're finished, the library looks at the difference between the element's current position, and the clone's position, and animates between them (using CSS transitions).