export function springAnimate(element, properties, options = {}) {
  const {
    damping = 1.0,
    response = 0.4,
    velocity = 0, // Initial velocity in px/s or similar units
    onComplete = null
  } = options;

  let active = true;
  let startTime = null;
  
  // Parse target properties
  const targets = {};
  const initials = {};
  const currentVelocities = {};
  
  // Helper to extract values
  const getComputedValue = (prop) => {
    const comp = window.getComputedStyle(element);
    if (prop === 'transform') {
      // Simplification: only handling translateY/X and scale in a basic way here for exact demo
      // In a full robust implementation you'd use DOMMatrix
      return element.style.transform || '';
    }
    return parseFloat(comp[prop]) || 0;
  };

  // Convert string values to numbers
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'number') {
      targets[key] = value;
      initials[key] = getComputedValue(key);
      currentVelocities[key] = velocity;
    } else if (typeof value === 'string') {
      // Simplistic parsing for transforms e.g., 'translateY(100px)'
      const match = value.match(/([a-zA-Z]+)\(([-\d.]+)px\)/);
      if (match) {
        targets[key] = { type: match[1], val: parseFloat(match[2]) };
        // Assume initial is 0 if not explicitly parsed for complexity
        const currentTransform = getComputedValue('transform');
        const currentMatch = currentTransform.match(new RegExp(`${match[1]}\\(([-\\d.]+)px\\)`));
        initials[key] = currentMatch ? parseFloat(currentMatch[1]) : 0;
        currentVelocities[key] = velocity;
      } else {
        // Fallback for opacity or other direct numeric strings
        targets[key] = parseFloat(value);
        initials[key] = getComputedValue(key);
        currentVelocities[key] = velocity;
      }
    }
  }

  // Spring constants
  const omega0 = (2 * Math.PI) / response; // Angular frequency
  const zeta = damping; // Damping ratio

  const step = (timestamp) => {
    if (!active) return;
    if (!startTime) startTime = timestamp;
    const t = (timestamp - startTime) / 1000; // time in seconds

    let allSettled = true;
    let transformString = '';

    for (const key of Object.keys(targets)) {
      const target = targets[key];
      const initial = initials[key];
      const v0 = currentVelocities[key];
      
      let targetVal = typeof target === 'object' ? target.val : target;
      let x0 = initial - targetVal;
      
      let x_t; // displacement from target
      let v_t; // current velocity

      if (zeta >= 1.0) {
        // Critically or Over-damped
        const c1 = x0;
        const c2 = v0 + omega0 * x0;
        const expTerm = Math.exp(-omega0 * t);
        x_t = (c1 + c2 * t) * expTerm;
        v_t = (c2 - omega0 * (c1 + c2 * t)) * expTerm;
      } else {
        // Under-damped
        const omega_d = omega0 * Math.sqrt(1 - zeta * zeta);
        const expTerm = Math.exp(-zeta * omega0 * t);
        const c1 = x0;
        const c2 = (v0 + zeta * omega0 * x0) / omega_d;
        const cosTerm = Math.cos(omega_d * t);
        const sinTerm = Math.sin(omega_d * t);
        
        x_t = expTerm * (c1 * cosTerm + c2 * sinTerm);
        v_t = -zeta * omega0 * expTerm * (c1 * cosTerm + c2 * sinTerm) + 
               expTerm * (-c1 * omega_d * sinTerm + c2 * omega_d * cosTerm);
      }

      const currentVal = targetVal + x_t;

      // Settlement check (position diff < 0.5 and velocity < 0.5)
      if (Math.abs(x_t) > 0.5 || Math.abs(v_t) > 0.5) {
        allSettled = false;
      }

      // Apply
      if (typeof target === 'object') {
        transformString += `${target.type}(${currentVal}px) `;
      } else {
        element.style[key] = currentVal;
      }
    }

    if (transformString) {
      element.style.transform = transformString.trim();
    }

    if (allSettled && t > 0) {
      // Snap to final values
      for (const key of Object.keys(targets)) {
        const target = targets[key];
        if (typeof target === 'object') {
          element.style.transform = `${target.type}(${target.val}px)`;
        } else {
          element.style[key] = target;
        }
      }
      active = false;
      if (onComplete) onComplete();
    } else {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);

  return {
    cancel: () => {
      active = false;
    }
  };
}

export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function project(initialVelocity, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

export function nearestSnapTarget(projectedPosition, targets) {
  return targets.reduce((nearest, target) =>
    Math.abs(target - projectedPosition) < Math.abs(nearest - projectedPosition) ? target : nearest
  );
}
