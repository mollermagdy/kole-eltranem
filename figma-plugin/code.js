/**
 * Export Layout + SVGs  (v2)
 *
 * Walks every selected frame and produces one JSON containing:
 *   - full geometry per node, both from the top-left and RTL-friendly
 *     (xFromRight / yFromBottom), plus offsets relative to the PARENT
 *   - clipping: clipsContent per node, plus `clippedByAncestor` and the
 *     computed visible rect, so overflow can be reproduced faithfully
 *   - corner radii (per corner), strokes, dashes, blend modes, effects
 *   - fills including gradient stops + gradientTransform and image scaleMode
 *   - text: content, per-range styles, font, size, spacing, case, decoration
 *   - auto-layout: mode, wrap, gaps, padding, alignment, sizing, per-child grow
 *   - constraints, layoutAlign, layoutGrow, rotation, and absolute transform
 *   - component/instance info, variant properties, exposed instance props
 *   - bound VARIABLES per field, plus every local variable + collection/mode
 *   - local paint/text/effect/grid styles, and styles referenced by nodes
 *   - the SVG source of every illustration, inlined
 *
 * Output goes to the UI, which saves it as a download.
 */

/* ── small helpers ──────────────────────────────────────────────────── */

function r2(n, places) {
  if (typeof n !== 'number' || !isFinite(n)) return null;
  const f = Math.pow(10, places == null ? 2 : places);
  return Math.round(n * f) / f;
}

function hex(v) {
  const c = Math.max(0, Math.min(255, Math.round(v * 255)));
  return c.toString(16).padStart(2, '0').toUpperCase();
}

function colorToHex(c) {
  if (!c) return null;
  return '#' + hex(c.r) + hex(c.g) + hex(c.b);
}

/** Drop keys that are null/undefined so the JSON stays readable. */
function clean(obj) {
  const out = {};
  for (const k in obj) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && !v.length) continue;
    out[k] = v;
  }
  return out;
}

function safe(fn, fallback) {
  try {
    const v = fn();
    return v === undefined ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

/* ── paints, strokes, effects ───────────────────────────────────────── */

function describePaint(paint) {
  if (!paint) return null;
  const base = {
    type: paint.type,
    visible: paint.visible !== false,
    opacity: paint.opacity != null ? r2(paint.opacity, 3) : undefined,
    blendMode: paint.blendMode !== 'NORMAL' ? paint.blendMode : undefined,
  };

  if (paint.type === 'SOLID') {
    base.color = colorToHex(paint.color);
    if (paint.color && paint.color.a != null && paint.color.a < 1) {
      base.alpha = r2(paint.color.a, 3);
    }
    return clean(base);
  }

  if (paint.type && paint.type.indexOf('GRADIENT') === 0) {
    base.stops = (paint.gradientStops || []).map(function (st) {
      return clean({
        position: r2(st.position, 4),
        color: colorToHex(st.color),
        alpha: st.color && st.color.a != null ? r2(st.color.a, 3) : undefined,
      });
    });
    // The 2x3 matrix that positions/rotates the gradient.
    if (paint.gradientTransform) {
      base.gradientTransform = paint.gradientTransform.map(function (row) {
        return row.map(function (n) {
          return r2(n, 5);
        });
      });
    }
    return clean(base);
  }

  if (paint.type === 'IMAGE') {
    base.scaleMode = paint.scaleMode;
    base.imageHash = paint.imageHash || undefined;
    base.scalingFactor = paint.scalingFactor != null ? r2(paint.scalingFactor, 3) : undefined;
    base.rotation = paint.rotation || undefined;
    if (paint.imageTransform) {
      base.imageTransform = paint.imageTransform.map(function (row) {
        return row.map(function (n) {
          return r2(n, 5);
        });
      });
    }
    return clean(base);
  }

  if (paint.type === 'VIDEO') {
    base.scaleMode = paint.scaleMode;
    return clean(base);
  }

  return clean(base);
}

function describePaints(paints) {
  if (!paints || paints === figma.mixed || !paints.length) return null;
  const list = [];
  for (let i = 0; i < paints.length; i++) {
    const p = describePaint(paints[i]);
    if (p && p.visible !== false) list.push(p);
  }
  return list.length ? list : null;
}

function describeStrokes(node) {
  const paints = describePaints(node.strokes);
  if (!paints) return null;
  return clean({
    paints: paints,
    weight: node.strokeWeight === figma.mixed ? 'mixed' : r2(node.strokeWeight, 2),
    align: node.strokeAlign,
    cap: node.strokeCap === figma.mixed ? 'mixed' : node.strokeCap,
    join: node.strokeJoin === figma.mixed ? 'mixed' : node.strokeJoin,
    miterLimit: node.strokeMiterLimit != null ? r2(node.strokeMiterLimit, 2) : undefined,
    dashPattern: node.dashPattern && node.dashPattern.length ? node.dashPattern : undefined,
    // Per-side weights (frames/rects only).
    top: node.strokeTopWeight != null ? r2(node.strokeTopWeight, 2) : undefined,
    right: node.strokeRightWeight != null ? r2(node.strokeRightWeight, 2) : undefined,
    bottom: node.strokeBottomWeight != null ? r2(node.strokeBottomWeight, 2) : undefined,
    left: node.strokeLeftWeight != null ? r2(node.strokeLeftWeight, 2) : undefined,
  });
}

function describeEffects(node) {
  if (!node.effects || node.effects === figma.mixed || !node.effects.length) return null;
  const list = [];
  for (let i = 0; i < node.effects.length; i++) {
    const e = node.effects[i];
    if (e.visible === false) continue;
    list.push(
      clean({
        type: e.type,
        radius: r2(e.radius, 2),
        color: e.color ? colorToHex(e.color) : undefined,
        alpha: e.color && e.color.a != null ? r2(e.color.a, 3) : undefined,
        offsetX: e.offset ? r2(e.offset.x, 2) : undefined,
        offsetY: e.offset ? r2(e.offset.y, 2) : undefined,
        spread: e.spread != null ? r2(e.spread, 2) : undefined,
        blendMode: e.blendMode && e.blendMode !== 'NORMAL' ? e.blendMode : undefined,
        showShadowBehindNode: e.showShadowBehindNode,
      })
    );
  }
  return list.length ? list : null;
}

function describeRadius(node) {
  if (node.cornerRadius === undefined) return null;
  if (node.cornerRadius === figma.mixed) {
    return clean({
      topLeft: r2(node.topLeftRadius, 2),
      topRight: r2(node.topRightRadius, 2),
      bottomRight: r2(node.bottomRightRadius, 2),
      bottomLeft: r2(node.bottomLeftRadius, 2),
      smoothing: node.cornerSmoothing ? r2(node.cornerSmoothing, 3) : undefined,
    });
  }
  if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    return node.cornerSmoothing
      ? { all: r2(node.cornerRadius, 2), smoothing: r2(node.cornerSmoothing, 3) }
      : r2(node.cornerRadius, 2);
  }
  return null;
}

/* ── text ───────────────────────────────────────────────────────────── */

function lineHeightOf(lh) {
  if (!lh || lh === figma.mixed) return 'mixed';
  if (lh.unit === 'AUTO') return 'auto';
  return { value: r2(lh.value, 2), unit: lh.unit };
}

function letterSpacingOf(ls) {
  if (!ls || ls === figma.mixed) return 'mixed';
  return { value: r2(ls.value, 3), unit: ls.unit };
}

function describeText(node) {
  if (node.type !== 'TEXT') return null;
  const fn = node.fontName === figma.mixed ? null : node.fontName;

  const out = {
    characters: node.characters,
    fontSize: node.fontSize === figma.mixed ? 'mixed' : r2(node.fontSize, 2),
    fontFamily: fn ? fn.family : 'mixed',
    fontStyle: fn ? fn.style : 'mixed',
    fontWeight: safe(function () {
      return node.fontWeight === figma.mixed ? 'mixed' : node.fontWeight;
    }),
    lineHeight: lineHeightOf(node.lineHeight),
    letterSpacing: letterSpacingOf(node.letterSpacing),
    textAlignHorizontal: node.textAlignHorizontal,
    textAlignVertical: node.textAlignVertical,
    textAutoResize: node.textAutoResize,
    textCase: node.textCase === figma.mixed ? 'mixed' : node.textCase,
    textDecoration: node.textDecoration === figma.mixed ? 'mixed' : node.textDecoration,
    paragraphSpacing: r2(node.paragraphSpacing, 2),
    paragraphIndent: r2(node.paragraphIndent, 2),
    textTruncation: node.textTruncation,
    maxLines: node.maxLines || undefined,
    hyperlink: node.hyperlink || undefined,
    listOptions: safe(function () {
      return node.listOptions && node.listOptions.type !== 'NONE' ? node.listOptions : undefined;
    }),
    leadingTrim: safe(function () {
      return node.leadingTrim;
    }),
  };

  // When any property is mixed, record the per-range styles so nothing is lost.
  const isMixed =
    node.fontSize === figma.mixed ||
    node.fontName === figma.mixed ||
    node.fills === figma.mixed ||
    node.lineHeight === figma.mixed;

  if (isMixed && node.characters && node.characters.length) {
    const segs = safe(function () {
      return node.getStyledTextSegments([
        'fontSize',
        'fontName',
        'fontWeight',
        'fills',
        'lineHeight',
        'letterSpacing',
        'textCase',
        'textDecoration',
      ]);
    }, null);

    if (segs && segs.length) {
      out.segments = segs.map(function (sg) {
        return clean({
          start: sg.start,
          end: sg.end,
          characters: sg.characters,
          fontSize: r2(sg.fontSize, 2),
          fontFamily: sg.fontName ? sg.fontName.family : undefined,
          fontStyle: sg.fontName ? sg.fontName.style : undefined,
          fontWeight: sg.fontWeight,
          lineHeight: lineHeightOf(sg.lineHeight),
          letterSpacing: letterSpacingOf(sg.letterSpacing),
          textCase: sg.textCase,
          textDecoration: sg.textDecoration,
          fills: describePaints(sg.fills),
        });
      });
    }
  }

  return clean(out);
}

/* ── auto layout, constraints ───────────────────────────────────────── */

function describeAutoLayout(node) {
  if (!node.layoutMode || node.layoutMode === 'NONE') return null;
  return clean({
    mode: node.layoutMode,
    wrap: node.layoutWrap,
    itemSpacing: r2(node.itemSpacing, 2),
    counterAxisSpacing:
      node.counterAxisSpacing != null ? r2(node.counterAxisSpacing, 2) : undefined,
    padding: {
      top: r2(node.paddingTop, 2),
      right: r2(node.paddingRight, 2),
      bottom: r2(node.paddingBottom, 2),
      left: r2(node.paddingLeft, 2),
    },
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    counterAxisAlignContent: node.counterAxisAlignContent,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode,
    itemReverseZIndex: node.itemReverseZIndex || undefined,
    strokesIncludedInLayout: node.strokesIncludedInLayout || undefined,
  });
}

function describeLayoutChild(node) {
  return clean({
    layoutAlign: node.layoutAlign,
    layoutGrow: node.layoutGrow,
    layoutPositioning: node.layoutPositioning !== 'AUTO' ? node.layoutPositioning : undefined,
    layoutSizingHorizontal: node.layoutSizingHorizontal,
    layoutSizingVertical: node.layoutSizingVertical,
    constraints: node.constraints
      ? { horizontal: node.constraints.horizontal, vertical: node.constraints.vertical }
      : undefined,
    minWidth: node.minWidth != null ? r2(node.minWidth, 2) : undefined,
    maxWidth: node.maxWidth != null ? r2(node.maxWidth, 2) : undefined,
    minHeight: node.minHeight != null ? r2(node.minHeight, 2) : undefined,
    maxHeight: node.maxHeight != null ? r2(node.maxHeight, 2) : undefined,
  });
}

/* ── components, variables, styles ──────────────────────────────────── */

function describeComponent(node) {
  const out = {};

  if (node.type === 'INSTANCE') {
    out.isInstance = true;
    const main = safe(function () {
      return node.mainComponent;
    }, null);
    if (main) {
      out.mainComponentId = main.id;
      out.mainComponentName = main.name;
      out.mainComponentKey = main.key;
      if (main.parent && main.parent.type === 'COMPONENT_SET') {
        out.componentSetName = main.parent.name;
      }
    }
    out.variantProperties = safe(function () {
      return node.variantProperties || undefined;
    });
    out.componentProperties = safe(function () {
      const props = node.componentProperties;
      if (!props) return undefined;
      const flat = {};
      for (const k in props) {
        flat[k] = clean({ type: props[k].type, value: props[k].value });
      }
      return flat;
    });
  }

  if (node.type === 'COMPONENT') {
    out.isComponent = true;
    out.componentKey = node.key;
    out.description = node.description || undefined;
    if (node.parent && node.parent.type === 'COMPONENT_SET') {
      out.componentSetName = node.parent.name;
      out.variantProperties = safe(function () {
        return node.variantProperties || undefined;
      });
    }
  }

  if (node.type === 'COMPONENT_SET') {
    out.isComponentSet = true;
    out.componentPropertyDefinitions = safe(function () {
      return node.componentPropertyDefinitions || undefined;
    });
  }

  return Object.keys(out).length ? clean(out) : null;
}

/** Variables bound to this node's fields (colour, size, text, visibility…). */
function describeBoundVariables(node) {
  const bv = safe(function () {
    return node.boundVariables;
  }, null);
  if (!bv) return null;

  const out = {};
  for (const field in bv) {
    const entry = bv[field];
    const resolveOne = function (alias) {
      if (!alias || !alias.id) return null;
      const v = safe(function () {
        return figma.variables.getVariableById(alias.id);
      }, null);
      return clean({ id: alias.id, name: v ? v.name : undefined, type: v ? v.resolvedType : undefined });
    };

    if (Array.isArray(entry)) {
      const arr = entry.map(resolveOne).filter(Boolean);
      if (arr.length) out[field] = arr;
    } else {
      const one = resolveOne(entry);
      if (one) out[field] = one;
    }
  }
  return Object.keys(out).length ? out : null;
}

/** Style references (shared paint/text/effect styles) on this node. */
function describeStyleRefs(node) {
  const nameOf = function (id) {
    if (!id || id === figma.mixed) return undefined;
    const st = safe(function () {
      return figma.getStyleById(id);
    }, null);
    return st ? st.name : id;
  };
  return clean({
    fillStyle: nameOf(node.fillStyleId),
    strokeStyle: nameOf(node.strokeStyleId),
    effectStyle: nameOf(node.effectStyleId),
    textStyle: nameOf(node.textStyleId),
    gridStyle: nameOf(node.gridStyleId),
  });
}

/* ── illustration detection ─────────────────────────────────────────── */

const VECTOR_TYPES = {
  VECTOR: true,
  BOOLEAN_OPERATION: true,
  STAR: true,
  LINE: true,
  POLYGON: true,
  ELLIPSE: true,
};

/**
 * Is this node a self-contained illustration worth exporting as one SVG?
 *
 * True for a single vector shape, and for a container of pure vector art —
 * but NOT for a container that holds several separable sub-groups, because
 * collapsing those would flatten a whole scene into one image and lose the
 * per-character layers you need in order to animate them independently.
 *
 * `opts.maxIllustrationArea` (fraction of the frame) stops a big scene being
 * swallowed whole; `opts.flattenLeaves` forces the old behaviour if you
 * actually want one flat file.
 *
 * `opts.framesAreArt` makes FRAMEs the unit of export: any frame of pure
 * vector art becomes exactly one SVG no matter how it's grouped inside, while
 * bare GROUPs are descended into. That's the reliable way to say "this thing
 * is one drawing" from the Figma side — name it a frame.
 */
function isIllustration(node, frame, opts) {
  if (VECTOR_TYPES[node.type]) return true;

  const CONTAINERS = { GROUP: 1, FRAME: 1, INSTANCE: 1, COMPONENT: 1 };
  if (!CONTAINERS[node.type] || !node.findAll) return false;

  // "Frames are art" mode: a frame is one SVG, a group is a container.
  if (opts && opts.framesAreArt) {
    const isFrameLike =
      node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT';
    if (!isFrameLike) return false;
    // Still refuse to bake text into paths.
    const hasText = safe(function () {
      return node.findAll(function (n) {
        return n.type === 'TEXT';
      }).length;
    }, 0);
    if (hasText) return false;
    // Don't swallow the selected root frame itself.
    if (frame && node.id === frame.id) return false;
    return true;
  }

  const kids = safe(function () {
    return node.findAll(function () {
      return true;
    });
  }, []);
  if (!kids.length) return false;

  let vectors = 0;
  let texts = 0;
  for (let i = 0; i < kids.length; i++) {
    if (VECTOR_TYPES[kids[i].type]) vectors++;
    if (kids[i].type === 'TEXT') texts++;
  }
  // Text must be preserved as real text, never baked into a path.
  if (texts > 0 || vectors < 3) return false;

  if (opts && opts.flattenLeaves) return true;

  // Count direct children that could each stand alone as their own drawing.
  const direct = node.children || [];
  let subContainers = 0;
  let splittable = 0;
  for (let i = 0; i < direct.length; i++) {
    const c = direct[i];
    if (c.visible === false) continue;
    if (CONTAINERS[c.type]) subContainers++;
    if (CONTAINERS[c.type] || VECTOR_TYPES[c.type]) splittable++;
  }

  // A container holding three or more sub-containers is a SCENE (a cast of
  // characters, a screen of panels), not a single illustration — descend so
  // each part exports separately and can be animated on its own.
  if (subContainers >= 3) return false;

  // Also descend when this node covers a large share of the frame and has
  // anything to split into: that's a backdrop-sized composite.
  const box = node.absoluteBoundingBox;
  const fBox = frame && frame.absoluteBoundingBox;
  if (box && fBox && fBox.width && fBox.height) {
    const frac = (box.width * box.height) / (fBox.width * fBox.height);
    const limit = opts && opts.maxIllustrationArea ? opts.maxIllustrationArea : 0.35;
    if (frac >= limit && splittable >= 2) return false;
  }

  return true;
}

/* ── geometry + clipping ────────────────────────────────────────────── */

/** Intersect two rects; returns null when they don't overlap. */
function intersect(a, b) {
  if (!a || !b) return null;
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return null;
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/* ── the walk ───────────────────────────────────────────────────────── */

/**
 * @param node       node being described
 * @param frame      the selected root frame (coordinates are relative to it)
 * @param parent     parent node, for parent-relative offsets
 * @param clipRect   accumulated clip rect from clipping ancestors (absolute)
 */
async function describeNode(node, frame, parent, depth, svgs, clipRect, opts) {
  const box = node.absoluteBoundingBox;
  const fBox = frame.absoluteBoundingBox;

  const out = {
    name: node.name,
    type: node.type,
    id: node.id,
    visible: node.visible !== false,
    locked: node.locked || undefined,
  };

  if (box && fBox) {
    // Relative to the selected frame.
    out.x = r2(box.x - fBox.x, 2);
    out.y = r2(box.y - fBox.y, 2);
    out.w = r2(box.width, 2);
    out.h = r2(box.height, 2);
    // RTL-friendly: distance from the frame's right / bottom edge.
    out.xFromRight = r2(fBox.x + fBox.width - (box.x + box.width), 2);
    out.yFromBottom = r2(fBox.y + fBox.height - (box.y + box.height), 2);

    // Relative to the parent — what you need to place a child inside a card.
    const pBox = parent && parent.absoluteBoundingBox;
    if (pBox) {
      out.relLeft = r2(box.x - pBox.x, 2);
      out.relTop = r2(box.y - pBox.y, 2);
      out.relRight = r2(pBox.x + pBox.width - (box.x + box.width), 2);
      out.relBottom = r2(pBox.y + pBox.height - (box.y + box.height), 2);
    }

    // Untransformed size, when rotation makes the bounding box bigger.
    if (node.width != null && node.height != null) {
      const rw = r2(node.width, 2);
      const rh = r2(node.height, 2);
      if (rw !== out.w || rh !== out.h) {
        out.unrotatedW = rw;
        out.unrotatedH = rh;
      }
    }
  }

  if (node.opacity != null && node.opacity < 1) out.opacity = r2(node.opacity, 3);
  if (node.rotation) out.rotation = r2(node.rotation, 2);
  if (node.blendMode && node.blendMode !== 'PASS_THROUGH' && node.blendMode !== 'NORMAL') {
    out.blendMode = node.blendMode;
  }
  if (node.isMask) out.isMask = true;

  /* ---- clipping / overflow ---- */
  if (node.clipsContent != null) out.clipsContent = node.clipsContent;

  // Does a clipping ancestor cut this node off?
  if (box && clipRect) {
    const vis = intersect(box, clipRect);
    if (!vis) {
      out.clippedByAncestor = 'fully';
    } else if (
      r2(vis.width, 1) !== r2(box.width, 1) ||
      r2(vis.height, 1) !== r2(box.height, 1)
    ) {
      out.clippedByAncestor = 'partially';
      out.visibleRect = {
        x: r2(vis.x - fBox.x, 2),
        y: r2(vis.y - fBox.y, 2),
        w: r2(vis.width, 2),
        h: r2(vis.height, 2),
      };
      // How much is cut off on each side.
      out.clippedAmount = clean({
        left: r2(vis.x - box.x, 2) || undefined,
        top: r2(vis.y - box.y, 2) || undefined,
        right: r2(box.x + box.width - (vis.x + vis.width), 2) || undefined,
        bottom: r2(box.y + box.height - (vis.y + vis.height), 2) || undefined,
      });
    }
  }

  // Does this node overflow its own parent's bounds? (Useful even when the
  // parent doesn't clip — it tells you the art is drawn larger by design.)
  const pBox2 = parent && parent.absoluteBoundingBox;
  if (box && pBox2) {
    const over = clean({
      left: r2(pBox2.x - box.x, 2) > 0 ? r2(pBox2.x - box.x, 2) : undefined,
      top: r2(pBox2.y - box.y, 2) > 0 ? r2(pBox2.y - box.y, 2) : undefined,
      right:
        r2(box.x + box.width - (pBox2.x + pBox2.width), 2) > 0
          ? r2(box.x + box.width - (pBox2.x + pBox2.width), 2)
          : undefined,
      bottom:
        r2(box.y + box.height - (pBox2.y + pBox2.height), 2) > 0
          ? r2(box.y + box.height - (pBox2.y + pBox2.height), 2)
          : undefined,
    });
    if (Object.keys(over).length) out.overflowsParent = over;
  }

  const radius = describeRadius(node);
  if (radius != null) out.radius = radius;

  const fills = describePaints(node.fills);
  if (fills) out.fills = fills;
  if (opts && opts.exportAssets) {
    const hashes = await exportImageFills(node, opts.assets);
    if (hashes.length) out.imageHashes = hashes;
  }

  const strokes = describeStrokes(node);
  if (strokes) out.stroke = strokes;

  const effects = describeEffects(node);
  if (effects) out.effects = effects;

  const text = describeText(node);
  if (text) out.text = text;

  const al = describeAutoLayout(node);
  if (al) out.autoLayout = al;

  // Only meaningful when the PARENT uses auto layout, or constraints are set.
  const lc = describeLayoutChild(node);
  if (Object.keys(lc).length) out.layout = lc;

  const comp = describeComponent(node);
  if (comp) out.component = comp;

  const vars = describeBoundVariables(node);
  if (vars) out.boundVariables = vars;

  const styleRefs = describeStyleRefs(node);
  if (Object.keys(styleRefs).length) out.styles = styleRefs;

  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    if (node.layoutGrids && node.layoutGrids.length) out.layoutGrids = node.layoutGrids;
    if (node.overflowDirection && node.overflowDirection !== 'NONE') {
      out.overflowDirection = node.overflowDirection;
    }
  }

  // vectorPaths is a getter that THROWS on some vectors (e.g. ones inside
  // instances or with complex vector networks) — that crashed whole exports.
  if (node.type === 'VECTOR') {
    try {
      const vp = node.vectorPaths;
      if (vp && vp.length) out.windingRule = vp[0].windingRule;
    } catch (e) {}
  }
  if (node.type === 'BOOLEAN_OPERATION') out.booleanOperation = node.booleanOperation;
  let arc = null;
  if (node.type === 'ELLIPSE') {
    try { arc = node.arcData; } catch (e) {}
  }
  if (arc) {
    const a = arc;
    if (a.startingAngle || a.endingAngle !== 6.2832 || a.innerRadius) {
      out.arcData = {
        startingAngle: r2(a.startingAngle, 4),
        endingAngle: r2(a.endingAngle, 4),
        innerRadius: r2(a.innerRadius, 4),
      };
    }
  }

  // Illustration? Export its SVG and stop descending.
  if (isIllustration(node, frame, opts)) {
    out.isIllustration = true;
    try {
      const bytes = await node.exportAsync({ format: 'SVG', svgSimplifyStroke: true });
      let str = '';
      const CH = 8192;
      for (let i = 0; i < bytes.length; i += CH) {
        str += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
      }
      const base = (node.name || 'art').replace(/[^a-zA-Z0-9_-]+/g, '_');
      const key = svgs[base] ? base + '_' + node.id.replace(/[^0-9]/g, '') : base;
      svgs[key] = str;
      out.svgKey = key;
      if (opts && opts.exportAssets) await exportPng(node, key, opts.assets);
    } catch (e) {
      out.svgError = String(e && e.message ? e.message : e);
    }
    return clean(out);
  }

  // Otherwise descend. Extend the clip rect if this node clips.
  const nextClip =
    node.clipsContent && box ? (clipRect ? intersect(box, clipRect) : box) : clipRect;

  if (node.children && node.children.length && depth < 24) {
    const kids = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.visible === false) continue;
      // One unreadable node must not abort the whole export — record and move on.
      let described;
      try {
        described = await describeNode(child, frame, node, depth + 1, svgs, nextClip, opts);
      } catch (e) {
        described = { name: child.name, id: child.id, type: child.type,
          error: String(e && e.message ? e.message : e) };
      }
      // Paint order: index 0 is the BACK-most layer.
      described.zIndex = i;
      kids.push(described);
    }
    if (kids.length) out.children = kids;
  }

  return clean(out);
}

/* ── document-level collections ─────────────────────────────────────── */

/** Every local variable, grouped by collection, with per-mode values. */
async function collectVariables() {
  const collections = await safe(async function () {
    return await figma.variables.getLocalVariableCollectionsAsync();
  }, []);
  if (!collections || !collections.length) return null;

  const out = [];
  for (let i = 0; i < collections.length; i++) {
    const col = collections[i];
    const modes = col.modes.map(function (m) {
      return { id: m.modeId, name: m.name };
    });

    const vars = [];
    for (let j = 0; j < col.variableIds.length; j++) {
      const v = await safe(async function () {
        return await figma.variables.getVariableByIdAsync(col.variableIds[j]);
      }, null);
      if (!v) continue;

      const values = {};
      for (let k = 0; k < col.modes.length; k++) {
        const mode = col.modes[k];
        let raw = v.valuesByMode[mode.modeId];
        if (raw && typeof raw === 'object') {
          if (raw.type === 'VARIABLE_ALIAS') {
            const alias = await safe(async function () {
              return await figma.variables.getVariableByIdAsync(raw.id);
            }, null);
            raw = { alias: alias ? alias.name : raw.id };
          } else if (raw.r !== undefined) {
            raw = clean({
              hex: colorToHex(raw),
              alpha: raw.a != null && raw.a < 1 ? r2(raw.a, 3) : undefined,
            });
          }
        }
        values[mode.name] = raw;
      }

      vars.push(
        clean({
          name: v.name,
          id: v.id,
          type: v.resolvedType,
          description: v.description || undefined,
          scopes: v.scopes && v.scopes.length && v.scopes[0] !== 'ALL_SCOPES' ? v.scopes : undefined,
          valuesByMode: values,
        })
      );
    }

    out.push(
      clean({
        collection: col.name,
        id: col.id,
        defaultModeId: col.defaultModeId,
        modes: modes,
        variables: vars,
      })
    );
  }
  return out.length ? out : null;
}

/** Local shared styles (paint / text / effect / grid). */
async function collectStyles() {
  const out = {};

  const paints = await safe(async function () {
    return await figma.getLocalPaintStylesAsync();
  }, []);
  if (paints && paints.length) {
    out.paint = paints.map(function (st) {
      return clean({ name: st.name, id: st.id, description: st.description || undefined, paints: describePaints(st.paints) });
    });
  }

  const texts = await safe(async function () {
    return await figma.getLocalTextStylesAsync();
  }, []);
  if (texts && texts.length) {
    out.text = texts.map(function (st) {
      return clean({
        name: st.name,
        id: st.id,
        fontFamily: st.fontName ? st.fontName.family : undefined,
        fontStyle: st.fontName ? st.fontName.style : undefined,
        fontSize: r2(st.fontSize, 2),
        lineHeight: lineHeightOf(st.lineHeight),
        letterSpacing: letterSpacingOf(st.letterSpacing),
        paragraphSpacing: r2(st.paragraphSpacing, 2),
        textCase: st.textCase,
        textDecoration: st.textDecoration,
      });
    });
  }

  const effects = await safe(async function () {
    return await figma.getLocalEffectStylesAsync();
  }, []);
  if (effects && effects.length) {
    out.effect = effects.map(function (st) {
      return clean({ name: st.name, id: st.id, effects: st.effects });
    });
  }

  const grids = await safe(async function () {
    return await figma.getLocalGridStylesAsync();
  }, []);
  if (grids && grids.length) {
    out.grid = grids.map(function (st) {
      return clean({ name: st.name, id: st.id, layoutGrids: st.layoutGrids });
    });
  }

  return Object.keys(out).length ? out : null;
}

/* ── PNG / raster asset export (the "Export PNGs + all assets" option) ── */

function safeName(n) {
  return (n || 'asset').replace(/[^a-zA-Z0-9_-]+/g, '_');
}

/** Render a node to PNG @2x, stored as base64 under assets.pngs[key]. */
async function exportPng(node, key, assets) {
  if (assets.pngs[key]) return;
  try {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });
    assets.pngs[key] = figma.base64Encode(bytes);
  } catch (e) {
    assets.errors.push(key + ': ' + String(e && e.message ? e.message : e));
  }
}

/** Original bitmaps behind IMAGE fills (photos, raster art), deduped by hash. */
async function exportImageFills(node, assets) {
  const out = [];
  let fills;
  try { fills = node.fills; } catch (e) { return out; }
  if (!Array.isArray(fills)) return out;
  for (let i = 0; i < fills.length; i++) {
    const f = fills[i];
    if (!f || f.type !== 'IMAGE' || !f.imageHash) continue;
    out.push(f.imageHash);
    if (assets.images[f.imageHash]) continue;
    try {
      const img = figma.getImageByHash(f.imageHash);
      const bytes = img ? await img.getBytesAsync() : null;
      if (bytes) {
        assets.images[f.imageHash] = { name: safeName(node.name), base64: figma.base64Encode(bytes) };
      }
    } catch (e) {
      assets.errors.push('image ' + f.imageHash + ': ' + String(e && e.message ? e.message : e));
    }
  }
  return out;
}

/* ── main ───────────────────────────────────────────────────────────── */

async function run(opts) {
  const sel = figma.currentPage.selection;

  if (!sel || !sel.length) {
    figma.ui.postMessage({
      error: 'Nothing selected. Select one or more frames, then press Export.',
    });
    return;
  }

  const sized = sel.filter(function (n) {
    return n.absoluteBoundingBox;
  });
  if (!sized.length) {
    figma.ui.postMessage({ error: 'The selection has no measurable size. Pick frames or groups.' });
    return;
  }

  const svgs = {};
  const frames = [];
  opts.assets = { pngs: {}, images: {}, errors: [] };

  for (let i = 0; i < sized.length; i++) {
    const frame = sized[i];
    figma.ui.postMessage({
      progress: 'Walking "' + frame.name + '" (' + (i + 1) + '/' + sized.length + ')…',
    });

    // A frame that clips starts the clip chain with its own bounds.
    const rootClip = frame.clipsContent ? frame.absoluteBoundingBox : null;
    const tree = await describeNode(frame, frame, frame.parent, 0, svgs, rootClip, opts);
    // Whole-frame PNG too, as a visual reference for "does the build match?".
    if (opts.exportAssets) await exportPng(frame, 'frame_' + safeName(frame.name), opts.assets);

    frames.push({
      name: frame.name,
      id: frame.id,
      type: frame.type,
      width: r2(frame.absoluteBoundingBox.width, 2),
      height: r2(frame.absoluteBoundingBox.height, 2),
      clipsContent: frame.clipsContent === true,
      tree: tree,
    });
  }

  figma.ui.postMessage({ progress: 'Collecting variables and styles…' });

  const payload = {
    exportedAt: new Date().toISOString(),
    pluginVersion: 2,
    file: figma.root.name,
    page: figma.currentPage.name,
    frameCount: frames.length,
    notes: {
      coords:
        'x/y are relative to each frame top-left. xFromRight/yFromBottom are ' +
        'RTL-friendly (distance from the right/bottom edge). relLeft/relTop/' +
        'relRight/relBottom are relative to the PARENT node.',
      clipping:
        'clipsContent = this node clips its children. clippedByAncestor = ' +
        '"partially"/"fully" when a clipping ancestor cuts this node, with ' +
        'visibleRect and clippedAmount. overflowsParent reports how far a ' +
        'node extends past its parent on each side even when not clipped.',
      zIndex: 'zIndex is the child paint order: 0 is the BACK-most layer.',
      svgs: 'svgs maps svgKey -> raw SVG source for each illustration.',
    },
    frames: frames,
    svgs: svgs,
  };

  if (opts.exportAssets) {
    payload.notes.assets =
      'pngs maps svgKey (or frame_<name>) -> base64 PNG @2x. images maps ' +
      'imageHash -> original bitmap (base64) for IMAGE fills; nodes list them ' +
      'in imageHashes.';
    payload.pngs = opts.assets.pngs;
    payload.images = opts.assets.images;
    if (opts.assets.errors.length) payload.assetErrors = opts.assets.errors;
  }

  if (opts && opts.includeVariables) {
    payload.variables = await collectVariables();
  }
  if (opts && opts.includeStyles) {
    payload.styles = await collectStyles();
  }

  figma.ui.postMessage({
    done: true,
    json: JSON.stringify(payload, null, 2),
    svgCount: Object.keys(svgs).length,
    pngCount: Object.keys(opts.assets.pngs).length + Object.keys(opts.assets.images).length,
    frameCount: frames.length,
    frameNames: frames.map(function (f) {
      return f.name;
    }),
  });
}

figma.showUI(__html__, { width: 360, height: 450 });

figma.ui.onmessage = function (msg) {
  if (!msg) return;
  if (msg.type === 'export') {
    run(msg.opts || {}).catch(function (e) {
      figma.ui.postMessage({ error: String(e && e.stack ? e.stack : e) });
    });
  }
  if (msg.type === 'selectionInfo') {
    const sel = figma.currentPage.selection || [];
    figma.ui.postMessage({
      selection: sel.map(function (n) {
        return { name: n.name, type: n.type };
      }),
    });
  }
  if (msg.type === 'close') figma.closePlugin();
};

// Keep the UI's selection readout live.
figma.on('selectionchange', function () {
  const sel = figma.currentPage.selection || [];
  figma.ui.postMessage({
    selection: sel.map(function (n) {
      return { name: n.name, type: n.type };
    }),
  });
});
