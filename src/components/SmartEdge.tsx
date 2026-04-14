import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react';

export default function SmartEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  label,
  data
}: EdgeProps) {
  
  const isSelfLoop = data?.isSelfLoop;
  const isBidirectional = data?.isBidirectional;

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  const R = 26; // Node radius (25) + 1px padding

  if (isSelfLoop) {
    // Clean self-loop: bezier arc above the node
    const angle1 = -Math.PI / 4; // -45 deg (exit)
    const angle2 = -3 * Math.PI / 4; // -135 deg (enter)
    
    const sx = sourceX + R * Math.cos(angle1);
    const sy = sourceY + R * Math.sin(angle1);
    
    const tx = sourceX + (R + 2) * Math.cos(angle2);
    const ty = sourceY + (R + 2) * Math.sin(angle2);
    
    // Control points to make a nice loop above
    const cp1x = sourceX + 60;
    const cp1y = sourceY - 80;
    const cp2x = sourceX - 60;
    const cp2y = sourceY - 80;

    edgePath = `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tx} ${ty}`;
    labelX = sourceX;
    labelY = sourceY - 65;
  } else {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normal for perpendicular offset
    const nx = -dy / distance;
    const ny = dx / distance;

    const offset = isBidirectional ? Math.min(50, distance * 0.25) : 15;
    
    // Control point
    const cx = (sourceX + targetX) / 2 + nx * offset;
    const cy = (sourceY + targetY) / 2 + ny * offset;

    // Vector from source to control point
    const sdx = cx - sourceX;
    const sdy = cy - sourceY;
    const sLen = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
    
    // Vector from control point to target
    const tdx = targetX - cx;
    const tdy = targetY - cy;
    const tLen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;

    // Source intersection with circle
    const sx = sourceX + (sdx / sLen) * R;
    const sy = sourceY + (sdy / sLen) * R;

    // Target intersection with circle (adding slightly more for the arrowhead)
    const tx = targetX - (tdx / tLen) * (R + 3);
    const ty = targetY - (tdy / tLen) * (R + 3);

    edgePath = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;

    // Place label at the peak of the curve (t=0.5 on quadratic bezier)
    labelX = 0.25 * sx + 0.5 * cx + 0.25 * tx;
    labelY = 0.25 * sy + 0.5 * cy + 0.25 * ty;
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#1e293b',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: 11,
              fontWeight: 700,
              color: '#e2e8f0',
              border: '1px solid #334155',
              fontFamily: 'monospace',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              letterSpacing: '0.05em',
              userSelect: 'none',
            }}
            className="nodrag nopan"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
