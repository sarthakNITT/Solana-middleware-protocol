import { useTransform, motion } from "framer-motion";

export function ScrollWord({ word, progress, start, end }: {
    word: string; progress: any; start: number; end: number;
}) {
    const range = Math.max(end - start, 0.001);


    const opacity = useTransform(progress, [start, end], [0.15, 1]);


    const color = useTransform(progress, [start, start + range * 0.7, end], ["#383844", "#E8734A", "#ece8ff"]);


    const combinedFilter = useTransform(progress, (v: number) => {
        const t = Math.max(0, Math.min(1, (v - start) / range));
        const blur = ((1 - t) * 5).toFixed(2);
        const gAlpha = (t * 0.32).toFixed(2);
        const gSize = (t * 10).toFixed(1);

        return t > 0.3
            ? `blur(${blur}px) drop-shadow(0 0 ${gSize}px rgba(232,115,74,${gAlpha}))`
            : `blur(${blur}px)`;
    });

    return (
        <motion.span
            style={{ opacity, color, filter: combinedFilter, fontSize: "55px", fontWeight: "400" }}
            className="font-light tracking-tight leading-tight"
        >
            {word}{"\u00A0"}
        </motion.span>
    );
}