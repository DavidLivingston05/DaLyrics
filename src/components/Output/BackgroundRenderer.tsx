import { motion, AnimatePresence } from 'motion/react';
import type { BackgroundType, BackgroundConfig, BackgroundTransition } from '../../types';

interface Props {
  type: BackgroundType;
  config: BackgroundConfig;
  opacity?: number;
  transition?: BackgroundTransition;
  transitionDuration?: number;
}

function renderContent(type: BackgroundType, config: BackgroundConfig) {
  switch (type) {
    case 'color': {
      const c = config as any;
      return <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: c.color || '#000000', opacity: c.opacity ?? 1 }} />;
    }
    case 'gradient': {
      const c = config as any;
      const angle = c.angle ?? 135;
      const colors = (c.colors ?? ['#000000', '#000000']).join(', ');
      return <div className="absolute inset-0 w-full h-full" style={{ background: `linear-gradient(${angle}deg, ${colors})` }} />;
    }
    case 'image': {
      const c = config as any;
      return (
        <div className="absolute inset-0 w-full h-full" style={{
          backgroundImage: `url(${c.filePath})`,
          backgroundSize: c.fit || 'cover',
          backgroundPosition: 'center',
          opacity: c.opacity ?? 1
        }} />
      );
    }
    case 'video': {
      const c = config as any;
      return (
        <video
          src={c.filePath}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: c.opacity ?? 1 }}
        />
      );
    }
    case 'white':
      return <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: '#ffffff' }} />;
    case 'black':
    default:
      return <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: '#000000' }} />;
  }
}

function getVariants(t: BackgroundTransition) {
  switch (t) {
    case 'cut': return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
    case 'dissolve': return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
    case 'fadeBlack': return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, backgroundColor: '#000' } };
    case 'fadeWhite': return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, backgroundColor: '#fff' } };
    case 'slideLeft': return { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -60 } };
    case 'slideRight': return { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 60 } };
    case 'slideUp': return { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -60 } };
    case 'slideDown': return { initial: { opacity: 0, y: -60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 60 } };
    case 'zoomIn': return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.1 } };
    case 'zoomOut': return { initial: { opacity: 0, scale: 1.1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 } };
    default: return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  }
}

export default function BackgroundRenderer({ type, config, opacity = 1, transition, transitionDuration = 0.8 }: Props) {
  const variants = getVariants(transition || 'dissolve');
  const bgKey = `${type}-${JSON.stringify(config)}`;
  const dur = transition === 'cut' ? 0 : transitionDuration;

  if (!transition || transition === 'cut') {
    return (
      <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none overflow-hidden" style={{ opacity }}>
        {renderContent(type, config)}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none overflow-hidden" style={{ opacity }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={bgKey}
          className="absolute inset-0 w-full h-full"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderContent(type, config)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
