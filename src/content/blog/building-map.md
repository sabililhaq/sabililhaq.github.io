---
title: "Building a map to compare multiple locations at once"
description: "A small map for a case where you have one destination and many locations to compare."
pubDate: 2026-08-30
---

I was looking at travel drop-off points for a trip to Bandung, the <a href="#fn-1" id="fnref-1">"Paris of Indonesia,"</a> so they said. Every travel agency has its own set of <a href="#fn-2" id="fnref-2">hubs</a>, and I wanted to know which one made the most sense for me.

Travel apps like Traveloka and tiket.com let me sort by distance, but none of them give me much visual context. They give me a ranked list.

For my case, I also wanted to see where each option actually sat relative to my other stops. Google Maps worked fine, but I had to check each option separately. It's pretty annoying.

That's how I ended up building Geoproximity.

<figure style="width: 90%; margin-left: auto; margin-right: auto;">
	<img src="/images/blog/geoproximity-map.png" alt="Geoproximity map with one destination pin, several comparison location pins, and a ranked distance list." />
	<figcaption>One destination, several options on the same map, plus the distance ranking.</figcaption>
</figure>

## Why not just use Google Maps?
Google Maps is good. I can search for a place, see the area around it, and check the distance.

But what I wanted was slightly different.

I wanted to put all the options in one place and compare them at the same time.

It's great when I want to look at one option. Geoproximity is for when I want to compare many options at once.

## The idea
One destination, several locations to compare against it.

Instead of checking one at a time:
```text
A → B
A → C
A → D
A → E
```

you get the comparison in one picture:
```text
         B
         │
 C ───── A ───── D
         │
         E
```

**The ranking isn't really the point. The visualization is.**

A location can be 2 km away while another one is 3 km away, so obviously the first one wins on paper. But maybe that second location is actually in a much more useful direction for the rest of my itinerary.

You can't tell that without geographical context.

## How it works
It consists of three main parts:

- Map renderer
- Geocoder
- Distance calculator

I use Leaflet for the map renderer and CARTO for the geocoder. They're kind enough to provide free endpoints for developers like me.

Everything else runs in the browser, with no backend.
```text
cations → coordinates → distance calculation → ranking → map
```

The distance calculation is the trivial part (<a href="#fn-3" id="fnref-3">great-circle</a>).

The harder part is getting the coordinates given a location.

## Finding locations with a free geocoder
Users don't input coordinates directly. They simply search for something like "Braga, Bandung" instead.

That's what the geocoder is for.

Google Maps does this really well, but of course, I can't just use Google Maps' API for a small project like this.

The main limitation here is accuracy and coverage.

The geocoder I use relies on open-source geocoding and location data, which isn't comprehensive enough to reliably find every specific place.

There is a practical workaround, though.

Geoproximity also supports manual coordinate input. If the geocoder can't find a specific location, you can search for it on Google Maps, copy its longitude and latitude, and paste them into Geoproximity.

<figure style="width: 80%; margin-left: auto; margin-right: auto;">
	<img src="/images/blog/google-maps-copy-latlng.png" alt="Google Maps showing a place with longitude and latitude that can be copied into Geoproximity." />
	<figcaption>If the geocoder misses a place, copy the coordinates from Google Maps.</figcaption>
</figure>

It's not as convenient, but it works.

## Sharing a comparison
A comparison can also be shared through a link, so someone else can open the same set of locations and see the same map.

<figure style="width: 50%; margin-left: auto; margin-right: auto;">
	<img src="/images/blog/geoproximity-share-link.png" alt="Copy link icon for sharing a Geoproximity comparison." />
	<figcaption>Send the same map, not a screenshot. (red rectangle)</figcaption>
</figure>

This is useful when you're actually trying to make a decision together, rather than just exploring the map yourself.

## More use cases
My travel case is just one example.

The general problem is:

"I have several locations. Which one makes the most sense geographically?"

It could be picking a meeting point, or choosing a restaurant that's fair to everyone's commute.

The specific problem changes, but the idea stays the same: put the alternatives on a map and compare them together.

## Summary
I built this because lists hide geography. If you have a destination and a pile of options, put them on one map.

It's free, simple to use, and pretty simple to implement.

From a technical standpoint, the most interesting part for me was how little setup this actually needs. I don't need to manage a backend, a database, or any infra. The browser does almost everything.

This project is possible because there are people generous enough to provide useful geospatial infra for free. Shoutout to <a href="https://github.com/Heramb1221/Cartis" id="fnref-4">Cartis,</a> which inspired me with this project.

Try it here: [sabililhaq.com/map](https://sabililhaq.com/map)

<hr />

<ol class="footnotes">
<li id="fn-1">
Paris van Java, if you want the local version ;D <a href="#fnref-1" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>
<li id="fn-2">
DayTrans, Jackal Holidays, Cititrans, each with several locations of their own. <a href="#fnref-2" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>
<li id="fn-3">
Great-circle distance: the shortest path between two points on the surface of a sphere. <a href="#fnref-3" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>
</ol>


