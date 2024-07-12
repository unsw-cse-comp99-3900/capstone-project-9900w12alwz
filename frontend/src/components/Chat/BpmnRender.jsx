import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Viewer from 'bpmn-js/lib/Viewer';
import './css/BpmnRender.css';

const BpmnRender = forwardRef(({ bpmnXML }, ref) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    exportToImage
  }));

  useEffect(() => {
    viewerRef.current = new Viewer({
      container: canvasRef.current,
    });

    const renderDiagram = async () => {
      try {
        const canvas = viewerRef.current.get('canvas');
        await viewerRef.current.importXML(bpmnXML);
        if (canvas && canvas.viewbox) {
          const { inner } = canvas.viewbox();
          const center = {
            x: inner.x + inner.width / 2,
            y: inner.y + inner.height / 2
          };
          canvas.zoom('fit-viewport', center);
          console.log('BPMN diagram rendered successfully');
        } else {
          console.error('Canvas or viewbox not initialized');
        }
      } catch (e) {
        console.error('Failed to render BPMN diagram:', e);
      }
    };

    renderDiagram();

    const handleResize = () => {
      if (viewerRef.current) {
        const canvas = viewerRef.current.get('canvas');
        if (canvas && canvas.viewbox) {
          const { inner } = canvas.viewbox();
          const center = {
            x: inner.x + inner.width / 2,
            y: inner.y + inner.height / 2
          };
          canvas.zoom('fit-viewport', center);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [bpmnXML]);

  const exportToImage = async () => {
    if (viewerRef.current) {
      try {
        const { svg } = await viewerRef.current.saveSVG();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to export diagram:', err);
      }
    } else {
      console.error('Viewer not initialized');
    }
  };

  return (
    <div>
      <div className="bpmn-canvas" ref={canvasRef}/>
    </div>
  );
});

export default BpmnRender;
