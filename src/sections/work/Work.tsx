import SectionField from "@/components/graphics/SectionField";
import WorkTransition from "@/sections/WorkTransition";
import AlgaeOSFeature from "./AlgaeOSFeature";
import DayflowFeature from "./DayflowFeature";
import GestureGlobeFeature from "./GestureGlobeFeature";
import MediTwinFeature from "./MediTwinFeature";
import SatQueryFeature from "./SatQueryFeature";

export default function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="visual-section"
      data-visual-tone="work"
    >
      <SectionField tone="work" />
      <WorkTransition />
      <SatQueryFeature />
      <GestureGlobeFeature />
      <AlgaeOSFeature />
      <DayflowFeature />
      <MediTwinFeature />
    </section>
  );
}
