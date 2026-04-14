import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export type DFANodeData = {
  label: string;
  isStart: boolean;
  isFinal: boolean;
};

export default function DFANode({ data }: { data: any }) {
  const { label, isStart, isFinal } = data as DFANodeData;

  return (
    <div className="relative flex items-center justify-center font-mono font-semibold text-slate-800 bg-white"
         style={{ 
           width: '50px', 
           height: '50px', 
           borderRadius: '50%',
           border: '2px solid #334155',
           boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
         }}>
      
      {/* Outer border for double circle if final state */}
      {isFinal && (
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          right: '4px',
          bottom: '4px',
          border: '1.5px solid #334155',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
      )}

      {/* Entry arrow for start state */}
      {isStart && (
        <div style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '25px', height: '1.5px', backgroundColor: '#334155' }} />
          <svg style={{ position: 'absolute', right: '-4px', fill: '#334155' }} width="10" height="10" viewBox="0 0 10 10">
            <polygon points="0,0 10,5 0,10" />
          </svg>
        </div>
      )}

      {label}
      
      <Handle type="target" position={Position.Top} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="source" position={Position.Bottom} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}
