---
title: "Building a map to compare multiple locations at once"
description: "A small map for a case where you have one destination and many locations to compare."
pubDate: 2026-08-29
---
# v2

I was looking at travel drop-off points for a trip to Bandung, the "Paris of Indonesia," so they say[1]. Every travel agency has its own set of hubs[2], and I wanted to know which one actually fit me best.

Most platforms let you sort by distance to a location, which is something, but none of them show you where those options actually sit relative to each other. They don't provide any visual context for it, which the part im wondering why[3]. 

Google Maps solve point-to-point version of this. The catch is that it works with one destination at a time. If I have five candidate drop-off points, I have to check each one separately and hold the comparison in my head: copy location, check Google Maps, compare, repeat. That's a small enough annoyance that I decided to just build the thing instead.

That's how Geoproximity happened.

The idea

One destination, several locations to compare against it. Geoproximity ranks them by distance and puts everything on a map.

The ranking isn't really the point; the visualization is. A location 2 km away will always "win" over one 3 km away on paper, but the closer one might sit in a dead-end direction relative to the rest of your itinerary, while the farther one is on the way to everything else you're doing. A number can't tell you that. A map can.

Why not just use Google Maps?

Google Maps already answers "how far is A from B?" really well. The problem changes shape once you have several candidates instead of one:

A → B
A → C
A → D
A → E
...

You end up repeating the same lookup and holding the comparison in your head. Geoproximity turns that into one picture instead:

              B
              │
       C ───── A ───── D
              │
              E

        ↓

     ranked by distance

The goal isn't to replace Google Maps. It's to make comparing several locations at once easier than doing it one pair at a time.

How it works

The stack is intentionally boring: Leaflet renders the map, while the map tiles come from CARTO (free for small projects like this). Everything else runs in the browser, no backend, an approach I picked up from Cartis, which showed me a free, backend-less geospatial project is a very doable thing.

text
locations → coordinates → distance calculation → ranking → map

The distance math is the easy part: I use great-circle distance[4] since the inputs are latitude/longitude pairs. The actual difficulty is upstream of that. Nobody hands you -6.9175, 107.6191. They give you "Braga, Bandung," and turning that into usable coordinates is where most of the real work lives.

Finding locations

This is the messy part. Turning a search query into coordinates means going through a geocoding service, and geocoding is never quite perfect: a place might not resolve, might resolve to several candidates, or might resolve to coordinates that are just slightly off. Since the ranking is only as good as its inputs, a bad geocode quietly produces a bad result even though the distance math itself is fine.

The built-in location data leans on open-source coverage, and that coverage simply isn't comprehensive everywhere, especially for smaller or more specific places. So when I really need something exact, I don't fight the geocoder. I just look the place up in Google Maps myself, copy the latitude and longitude, and paste those directly into Geoproximity. It's a manual step, but it's an honest one: rather than pretend the open-source data is always good enough, Geoproximity just gets out of the way and lets you supply the ground truth yourself.

Sharing a comparison

Any comparison you build can be shared with a link, so someone else can see the same set of options and the same map without rebuilding it themselves.

Not just for travel

The travel-hub problem was just the starting point. The same shape shows up anywhere you're asking "I have several locations, which one makes the most sense geographically?": picking a meeting point when people are coming from different places, or choosing a restaurant that's fair to everyone's commute. Anything where you'd otherwise be eyeballing several separate distances at once fits.

That's basically it

Under the hood, Geoproximity is just: places → coordinates → distance → ranking → map. Leaflet draws it, CARTO tiles it, the browser does the rest.

I built this because comparing locations one at a time was mildly annoying, and it turned out the annoying part wasn't the math. It was everything around it: getting clean coordinates, wrangling the location data, and making the output good enough that I don't reflexively open Google Maps anyway.

Next up is network-based distance instead of straight-line: actual routing rather than "as the crow flies." It's also usable as an embeddable library if you want to drop it into your own project; details are in the repo.

Try it here → sabililhaq.com/map

Footnotes

[1] Paris van Java, if you want the local version ;D
[2] DayTrans, Jackal Holidays, Cititrans, each with several locations of their own.
[3] I guess the use case is pretty rare, but it bugs me anyway.
[4] Great-circle distance: the shortest path between two points on the surface of a sphere, the right way to measure "as the crow flies" on Earth.

===
# v1

I was looking at travel drop-off points for a trip to Bandung, the <a href="#fn-1" id="fnref-1">"Paris of Indonesia"</a> so they say. Every travel agency has its own set of hubs[2], and I wanted to know which one actually fit me best.

I was looking at travel drop-off points for Bandung[1]. Different agencies had different hubs [2], and I wanted to know which one was fit me the best.

They did provide sorting by distance to a certain location. Leading travel platform does not provide visual context of it, i dont understand why, they can only sort by distance. I personally don't get why [3].

Google Maps can do the job from A to B, but if i given option of A to B,C,D, or E, it requires me to input all of those thing separately. It's not really hard, but it annoys me enough that I want to make a small thing for it.

That's how I ended up building [Geoproximity](https://sabililhaq.com/map).

# The idea
The idea is simple. I have one destination, then a bunch of locations that I want to compare against it. 

Geoproximity will ranks them and show everything on a map.

The rank here is not the selling points; the visualization is. You can call it "geographical context"

A location can be 2 km away while another one is 3 km away, so obviously the first one wins in terms of distance. But maybe that second location is actually in a much more useful direction for the rest of my itinerary. That thing you can't tell if given rank only.

# How it works

It built with existing soutions; Leaflet for map, while the map tiles come from CARTO. CARTO provides API keys that are free to use for small projects like this.

The rest happens directly in the browser. The user provides a destination and the locations to compare, the browser calculates the distance, sorts the results, and renders them on the map.

So there isn't really much of a backend involved:

```text
locations
    ↓
coordinates
    ↓
distance calculation
    ↓
ranking
    ↓
map
```

# The ranking system
The actual ranking is pretty boring. Each location gets a distance from the destination, then I sort them.

Since the input is latitude and longitude, I use great-circle[4] distance to calculate the distance between two points over the surface of the Earth.

Conceptually:

```text
destination
    ↓
calculate distance
    ↓
each location gets a number
    ↓
sort
    ↓
show on map
```

The harder part is everything around that calculation. A user doesn't normally give me `-6.9175, 107.6191`. They give me something like "Braga, Bandung", so I need to turn that into coordinates first.

# Finding locations

This is where things get a little messier.

When the user searches for a place, I need a geocoding service to turn the search query into coordinates. The result isn't always perfect. A place might not be found, there might be multiple results, or the coordinates might simply not be as accurate as I'd like.

This also means that a correct distance calculation can still produce a bad result if the input coordinates are bad. Garbage in, garbage out.

For now, if I really care about the exact coordinates of a location, I can just search for it in Google Maps, copy the latitude and longitude, and put those directly into Proximity.

# Why not just use Google Maps?
Honestly, you can.

Google Maps already does most of the things here really well. You can search for a place, get its coordinates, check the distance, and get actual driving directions.

What I wanted was slightly different. I wanted to put all the options in one place and compare them at the same time.

# You can share it
To make it more useful, you can create a comparison and share the data with someone else.
Just click share, people can see what you've built

# That's basically it
There isn't a particularly complicated system behind Proximity. It's basically places → coordinates → distance calculation → ranking → map.

Leaflet handles the map, CARTO provides the map tiles, and the rest can happen directly in the browser.

I initially built this because I was annoyed of comparing locations one at a time. It turned out that the actual implementation was pretty simple.

The math is easy. Most of the work is in everything around it: getting usable coordinates, handling the location data, and making the result useful enough that I don't immediately have to go back to Google Maps.

[Try it here → sabililhaq.com/map](https://sabililhaq.com/map)


# Footnotes
Shoutout to Cartis that inspired me to build this client side map project: (https://github.com/Heramb1221/Cartis)


[1] Paris of Indonesia they told (paris van java ;D)
[2] daytrans, jackalholidays, cititrans, with multiple locations for each.
[3] I guess the use case is pretty rare



# claude
https://claude.ai/chat/2425e81b-aee6-4930-90db-d1200ecc8d7e


===
When running an AI agent, I often get into this situation:

Agent changes a lot of files, then I need to nitpick all <a href="#fn-1" id="fnref-1">their changes</a> (`git add`).

At the same time, I got a lot of irrelevant changes that I forgot to stash, or any old files I won't care in a particular session.

This command saves me:

```bash
(
  git diff --name-only
  git diff --cached --name-only
  git ls-files --others --exclude-standard
) | sort -u | while read -r f; do [ -e "$f" ] && echo "$f"; done \
| xargs -I{} stat -f "%Sm %N" -t "%d %b %H:%M" {} \
| sort -r
```

Basically it runs the git diff stuff, then sorts by last changed.

I don't think VSCode has this capability.

I use it a lot when orchestrating an agent, but need to cherry-pick the changes I need to add.

You could use it as an alias if you might use it often. Add it to your `~/.bashrc` or `~/.zshrc`:

```bash
gls () {
  (
    git diff --name-only
    git diff --cached --name-only
    git ls-files --others --exclude-standard
  ) | sort -u | while read -r f; do [ -e "$f" ] && echo "$f"; done \
  | xargs -I{} stat -f "%Sm %N" -t "%d %b %H:%M" {} \
  | sort -r
}
```

Example usage:

<figure>
	<img src="/images/blog/sortable-git-status.png" alt="Left: git status. Right: gls, with files sorted by last changed time." />
	<figcaption>Left: git status. Right: gls. I can see irrelevant files to be added (in this case, .codegraph/.gitignore).</figcaption>
</figure>

<hr />

<ol class="footnotes">
<li id="fn-1">
Paris van Java, if you want the local version ;D <a href="#fnref-1" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>
<li id="fn-2">
I could ask the agent to add their changes, but they often make annoying mistakes, they add everything, stash stuff they shouldn't, or stage half the wrong files. <a href="#fnref-2" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>
</ol>
