class Analyzer {

  static composePropositions(conceptMap) {
    let propositions = []
    let cMap = conceptMap
    let gMap = conceptMap.conceptMap ? conceptMap.conceptMap : conceptMap

    let concepts = new Map(gMap.concepts.map(concept => [concept.cid, concept]));
    let links = new Map(gMap.links.map(link => [link.lid, link]));
    // console.error(concepts, links)
    if (!gMap.propositions) {
      gMap.linktargets.forEach(linktarget => {
        let prop = {
          source: concepts.get(links.get(linktarget.lid).source_cid),
          link: links.get(linktarget.lid),
          target: concepts.get(linktarget.target_cid)
        }
        if (prop.source && prop.target) propositions.push(prop)
      });
      gMap.propositions = propositions
    } else propositions = gMap.propositions

    if (gMap == cMap) return propositions

    propositions = []
    if (!cMap.propositions) {
      let lLinks = new Map(cMap.links.map(link => [link.lid, link]));
      cMap.linktargets.forEach(linktarget => {
        let prop = {
          source: concepts.get(lLinks.get(linktarget.lid).source_cid),
          link: links.get(lLinks.get(linktarget.lid).lid),
          target: concepts.get(linktarget.target_cid)
        }
        if (prop.source && prop.target) propositions.push(prop)
      });
      cMap.propositions = propositions
    } else propositions = cMap.propositions
    return propositions
  }

  static compare(conceptMap, direction = 'multi') {
    if (!conceptMap.conceptMap) return // this is a goalmap, nothing to compare with
    
    let gPropositions = conceptMap.conceptMap.propositions.map(p => {
      // console.warn(p)
      return {
        source: p.source.label,
        sid: p.source.cid,
        link: p.link.label,
        lid: p.link.lid,
        target: p.target.label,
        tid: p.target.cid,
      }
    })

    let propositions = conceptMap.propositions.map(p => {
      // console.warn(p)
      return {
        source: p.source.label,
        sid: p.source.cid,
        link: p.link.label,
        lid: p.link.lid,
        target: p.target.label,
        tid: p.target.cid,
      }
    })
    
    let matchg = [], miss = [], excess = [], leave = [], match = [], abandon = []
    
    let g = gPropositions.length
    while(g--) {
      let gProp = gPropositions[g]
      let found = false
      let p = propositions.length
      while(p--) {
        let prop = propositions[p]
        // console.log(direction, gProp.source + ">" + gProp.link + ">" + gProp.target, prop.source + ">" + prop.link + ">" + prop.target)
        if (gProp.source == prop.source && gProp.link == prop.link && gProp.target == prop.target) {
          let matchPropositionOnGoalmap = gPropositions.splice(g, 1)[0]
          let matchProposition = propositions.splice(p, 1)[0]
          matchg.push(matchPropositionOnGoalmap)
          match.push(matchProposition)
          found = true
          // console.log("FOUND A", matchg, match)
        } else if (direction == 'bi' && gProp.source == prop.target && gProp.link == prop.link && gProp.target == prop.source) {
          // if current map type is bidirectional, also consider the reversed direction as matching proposition
          let matchPropositionOnGoalmap = gPropositions.splice(g, 1)[0]
          let matchProposition = propositions.splice(p, 1)[0]
          matchg.push(matchPropositionOnGoalmap)
          match.push(matchProposition)
          // console.log("FOUND B", matchg, match)
          found = true
        }
      }
      if (!found) miss.push(gPropositions.splice(g, 1)[0])
    }
    excess = propositions

    leave = miss.map(m => { return Object.assign({}, m) }) // clone miss
    let tempExcess = excess.map(e => { return Object.assign({}, e)}) // clone excess
    let l = leave.length
    while (l--) {
      let lv = leave[l]
      let e = tempExcess.length
      while (e--) {
        let ex = tempExcess[e]
        if (lv.sid == ex.sid && lv.link == ex.link) {
          leave.splice(l, 1)
          tempExcess.splice(e, 1)
          break;
        }
      }
    }

    miss.forEach(m => {
      let found = false
      // console.error(match)
      for(let mt of match) { // console.warn(m, mt)
        if (m.source == mt.source) {
          found = true
          break;
        }
      }
      if (!found)
        for(let ex of excess) { // console.warn(m, ex)
          if (m.source == ex.source) {
            found = true
            break;
          }
        }
      if (!found) abandon.push(m)
    })

    let compare = {
      match: match, 
      miss: miss, 
      excess: excess, 
      leave: leave, 
      matchg: matchg,
      abandon: abandon,
      score: match.length / conceptMap.conceptMap.propositions.length
    }
    return compare
  }

  // Assume that learner concept map is already shown in canvas.
  // Will show the comparison map from learner perspective
  static showCompareMap(compare, cy, direction = 'multi', level = Analyzer.NONE) {
    if (level & Analyzer.MATCH) {
      compare.match.forEach(m => {
        cy.edges(`[source="${m.lid}"][target="${m.tid}"]`).addClass('match')
      })
    }
    if (level & Analyzer.EXCESS) {
      compare.excess.forEach(e => {
        cy.edges(`[source="${e.lid}"][target="${e.tid}"]`).addClass('excess')
      })
    }

    if (level & Analyzer.EXPECT) { // draw expected links
      cy.edges('.expect').remove()
      compare.miss.forEach(e => {
        cy.add({
          group: "edges",
          data: {
            source: e.sid,
            target: e.tid,
            label: '?'
          }
        }).addClass('expect')
      })
    }

    if (level & Analyzer.MISS) {
      cy.edges('.miss').remove()
      compare.miss.forEach(e => {
        let source = (cy.nodes(`[type="link"][label="${e.link}"]`).connectedEdges(`[type="left"][target="${e.sid}"]`).data('source'))
        cy.add({
          group: "edges",
          data: {
            source: source ? source : e.lid,
            target: e.tid,
            type: "right"
          }
        }).addClass('miss')
        if (!source) {
          cy.add({
            group: "edges",
            data: {
              source: e.lid,
              target: e.sid,
              type: "left"
            }
          }).addClass('miss')
        }
      })
    }
  }

  static groupCompare(learnerMaps) {
    let matches = new Map(),
      misses    = new Map(),
      excesses  = new Map(),
      leaves    = new Map(),
      abandons  = new Map()
    learnerMaps.forEach(lm => {
      lm.compare.matchg.forEach(m => {
        let key = `${m.sid}|${m.link}|${m.tid}`
        let proposition = (matches.has(key)) ?
          matches.get(key) : 
          Object.assign({count: 0}, m);
        proposition.count++
        if (!matches.has(key)) 
          matches.set(key, proposition)
      })
      lm.compare.miss.forEach(m => {
        let key = `${m.sid}|${m.link}|${m.tid}`
        let proposition = (misses.has(key)) ?
          misses.get(key) : 
          Object.assign({count: 0}, m);
        proposition.count++
        if (!misses.has(key)) 
          misses.set(key, proposition)
      })
      lm.compare.excess.forEach(m => {
        let key = `${m.sid}|${m.link}|${m.tid}`
        let proposition = (excesses.has(key)) ?
          excesses.get(key) : 
          Object.assign({count: 0}, m);
        proposition.count++
        if (!excesses.has(key)) 
          excesses.set(key, proposition)
      })
      lm.compare.leave.forEach(m => {
        let key = `${m.sid}|${m.link}|${m.tid}`
        let proposition = (leaves.has(key)) ?
          leaves.get(key) : 
          Object.assign({count: 0}, m);
        proposition.count++
        if (!leaves.has(key)) 
          leaves.set(key, proposition)
      })
      lm.compare.abandon.forEach(m => {
        let key = `${m.sid}|${m.link}|${m.tid}`
        let proposition = (abandons.has(key)) ?
          abandons.get(key) :
          Object.assign({count: 0}, m);
        proposition.count++
        if (!abandons.has(key)) 
          abandons.set(key, proposition)
      })

    })
    // console.warn(matches, misses, excesses, leaves, abandons)
    return {
      match: Array.from(matches.values()),
      miss: Array.from(misses.values()),
      excess: Array.from(excesses.values()),
      leave: Array.from(leaves.values()),
      abandon: Array.from(abandons.values())
    }
  }

  static showGroupCompareMap(groupCompare, cy, direction = 'multi') {
    cy.edges().remove()
    groupCompare.match.forEach(m => {
      cy.add({
        group: "edges",
        data: {
          source: m.lid,
          target: m.tid,
          type: "right",
          count: m.count
        }
      }).addClass('match')
      let sourceEdge = cy.edges(`[source="${m.lid}"][target="${m.sid}"]`)
      if (sourceEdge.length == 0) {
        cy.add({
          group: "edges",
          data: {
            source: m.lid,
            target: m.sid,
            type: "left",
            count: m.count
          }
        }).addClass('match')
      } else {
        let count = sourceEdge.data('count');
        sourceEdge.data('count', count += m.count)
      }
    })
    groupCompare.excess.forEach(e => {
      cy.add({
        group: "edges",
        data: {
          source: e.lid,
          target: e.tid,
          type: "right",
          count: e.count
        }
      }).addClass('excess')
      let sourceEdge = cy.edges(`[source="${e.lid}"][target="${e.sid}"]`)
      if (sourceEdge.length == 0) {
        cy.add({
          group: "edges",
          data: {
            source: e.lid,
            target: e.sid,
            type: "left",
            count: e.count
          }
        }).addClass('match')
      } else {
        let count = sourceEdge.data('count');
        sourceEdge.data('count', count += e.count)
      }
    })
    groupCompare.miss.forEach(e => {
      let source = (cy.nodes(`[type="link"][label="${e.link}"]`).connectedEdges(`[type="left"][target="${e.sid}"]`).data('source'))
      cy.add({
        group: "edges",
        data: {
          source: source ? source : e.lid,
          target: e.tid,
          type: "right",
          count: e.count
        }
      }).addClass('miss')
      let sourceEdge = cy.edges(`[source="${source ? source : e.lid}"][target="${e.sid}"]`)
      if (sourceEdge.length) {
        let count = sourceEdge.data('count');
        sourceEdge.data('count', count += e.count)
      }
      if (!source) {
        cy.add({
          group: "edges",
          data: {
            source: e.lid,
            target: e.sid,
            type: "left",
            count: e.count
          }
        }).addClass('miss')
      }
    })
    cy.edges(`[type="left"]`).removeClass("match miss excess leave")
    cy.edges().addClass('count')
    let min = Infinity, max = 0
    cy.edges().not('[type="left"]').forEach(e => {
      min = min > e.data('count') ? e.data('count') : min
      max = max < e.data('count') ? e.data('count') : max
    })
    return {
      edges: cy.edges(),
      min: min,
      max: max
    }
  }
  
}

Analyzer.NONE = 0
Analyzer.MATCH = 1
Analyzer.EXCESS = 2
Analyzer.MISS = 4
Analyzer.EXPECT = 8