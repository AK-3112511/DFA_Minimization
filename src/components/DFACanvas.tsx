'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DFA } from '@/types/dfa';
import DFANode from './DFANode';
import SmartEdge from './SmartEdge';

const nodeTypes = {
  dfaNode: DFANode,
};
const edgeTypes = {
  smartEdge: SmartEdge,
};

interface DFACanvasProps {
  dfa: DFA;
  title?: string;
}

export default function DFACanvas({ dfa, title }: DFACanvasProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];
    
    const states = dfa.states;
    const radius = Math.max(100, states.length * 30);
    const centerX = 200;
    const centerY = 150;

    states.forEach((state, index) => {
      const isStart = state === dfa.startState;
      const isFinal = dfa.finalStates.includes(state);
      
      // Standard Circular Distribution
      const angle = (index / states.length) * 2 * Math.PI + Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      rawNodes.push({
        id: state,
        position: { x, y },
        data: { label: state, isStart, isFinal },
        type: 'dfaNode',
        draggable: true, // Crucial for custom hand-drawn arrangements
      });
    });

    const edgeMap: Record<string, string[]> = {};
    for (const [source, row] of Object.entries(dfa.transitions)) {
      for (const [symbol, target] of Object.entries(row)) {
        if (!target) continue;
        const key = `${source}->${target}`;
        if (!edgeMap[key]) edgeMap[key] = [];
        edgeMap[key].push(symbol);
      }
    }

    Object.entries(edgeMap).forEach(([key, symbols], index) => {
      const [source, target] = key.split('->');
      
      const isSelfLoop = source === target;
      // Check if there is an opposite edge pointing back
      const isBidirectional = !isSelfLoop && !!edgeMap[`${target}->${source}`];
      
      rawEdges.push({
        id: `e-${source}-${target}-${index}`,
        source,
        target,
        label: symbols.join(', '),
        markerEnd: isSelfLoop ? undefined : { type: MarkerType.ArrowClosed, color: '#334155' },
        style: { stroke: '#475569', strokeWidth: 1.5 },
        type: 'smartEdge',
        data: { isSelfLoop, isBidirectional },
        animated: false
      });
    });

    return { initialNodes: rawNodes, initialEdges: rawEdges };
  }, [dfa]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
      {title && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 px-4 py-2 rounded-lg text-slate-800 font-semibold shadow-sm backdrop-blur-md border border-slate-200 text-sm">
          {title}
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 bg-blue-50/90 text-blue-800 text-xs px-3 py-1.5 rounded border border-blue-200 flex items-center gap-2 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/></svg>
        States are draggable! Customize your layout
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.1}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
        <Controls className="fill-slate-600 bg-white border-slate-200 shadow-sm" />
      </ReactFlow>
    </div>
  );
}
