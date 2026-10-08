import re

with open("src/app/(dashboard)/asset/[id]/page.tsx", "r") as f:
    content = f.read()

# Instead of rewriting the whole file, let's inject a fetch and use the real state.

# Change function signature
content = content.replace("export default function AssetDetailsPage() {", """
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function AssetDetailsPage() {
  const params = useParams();
  const id = (params?.id as string)?.toUpperCase() || "HVAC-01";
  
  const [assetData, setAssetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/assets")
      .then(res => res.json())
      .then(data => {
        // find asset by type for demo (e.g. if id is hvac-01, search for HVAC)
        const type = id.split('-')[0];
        const asset = data.assets.find((a:any) => a.asset_type === type) || data.assets[0];
        setAssetData(asset);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center animate-pulse text-primary">Initializing AI diagnostic for {id}...</div>;
  }

  // Update dummy variables with real ones
  const anomalyScore = assetData.predictions.anomaly_score;
  const failureProb = assetData.predictions.failure_probability;
  const rul = Math.max(1, Math.floor(assetData.predictions.rul_days));
  const healthScore = assetData.health.score;
  const healthState = assetData.health.state; // Normal, Elevated, High, Critical
  
  const rootCause = assetData.neurosymbolic.root_cause;
  const reasoningList = assetData.neurosymbolic.reasoning;
  const recommendedAction = assetData.neurosymbolic.recommended_action;

  const getStatusColor = () => {
    if (healthState === 'Critical') return 'text-critical';
    if (healthState === 'Normal') return 'text-healthy';
    return 'text-warning';
  };
  
""")

# Now replace hardcoded texts
content = content.replace(">HVAC-04<", ">{id}<")
content = content.replace(">Roof HVAC Unit<", ">{assetData.type_label}<")
content = content.replace(">ASAP (48h window)<", ">{rul <= 7 ? 'ASAP (48h window)' : `Within ${rul} days`}<")
content = content.replace('>48<', '>{healthScore}<')
content = content.replace('>91<', '>{failureProb}<')
content = content.replace('>42 days ago<', '>{assetData.last_service}<')
content = content.replace('>6<', '>{rul}<')
content = content.replace('>71%<', '>{failureProb}%<')
content = content.replace('>16%<', '>{Math.max(0, 100 - failureProb - 10)}%<')
content = content.replace('cause="01 Bearing degradation"', 'cause={`01 ${rootCause}`}')
content = content.replace('>High risk state<', '>{healthState} risk state<')

content = content.replace('<MetricCard label="Failure Risk" value="91" suffix="%" color="text-critical" />', '<MetricCard label="Failure Risk" value={failureProb.toString()} suffix="%" color={getStatusColor()} />')
content = content.replace('<MetricCard label="Health Score" value="48" suffix="/100" color="text-warning" />', '<MetricCard label="Health Score" value={healthScore.toString()} suffix="/100" color={getStatusColor()} />')
content = content.replace('<MetricCard label="RUL" value="6" suffix="days" color="text-critical" />', '<MetricCard label="RUL" value={rul.toString()} suffix="days" color={getStatusColor()} />')
content = content.replace('<MetricCard label="Anomaly Score" value="-4.2" suffix="" color="text-critical" />', '<MetricCard label="Anomaly Score" value={anomalyScore.toString()} suffix="" color={getStatusColor()} />')

content = content.replace('<ReasoningStep text="Fuzzy Risk = HIGH" alert />', '<ReasoningStep text={`Fuzzy Risk = ${healthState.toUpperCase()}`} alert={healthState === "Critical"} highlight={healthState === "High" || healthState === "Elevated"} />')
content = content.replace('<ReasoningStep text="Symbolic Rules = CONSISTENT" />', '<ReasoningStep text={`Rule: ${rootCause}`} />')

content = content.replace('<span className="text-critical">HIGH</span>', '<span className={getStatusColor()}>{healthState.toUpperCase()}</span>')
content = content.replace('<span className="text-critical font-mono">91%</span>', '<span className={getStatusColor() + " font-mono"}>{failureProb}%</span>')
content = content.replace('<span className="text-warning font-mono">87%</span>', '<span className="text-warning font-mono">{Math.max(0, failureProb - 10)}%</span>')

# Update fuzzy memberships
content = content.replace('value={53}', 'value={assetData.sensors.temperature}')
content = content.replace('value={4.5}', 'value={assetData.sensors.vibration}')
content = content.replace('value={28}', 'value={assetData.sensors.current}')

# Adjust percentages for visual graph for fuzzy mapping
# Very rough percentage logic based on typical range
content = content.replace('percentage={85}', 'percentage={Math.min(100, Math.max(0, (assetData.sensors.temperature / 100) * 100))}')
content = content.replace('percentage={80}', 'percentage={Math.min(100, Math.max(0, (assetData.sensors.vibration / 10) * 100))}')
content = content.replace('percentage={90}', 'percentage={Math.min(100, Math.max(0, (assetData.sensors.current / 50) * 100))}')


with open("src/app/(dashboard)/asset/[id]/page.tsx", "w") as f:
    f.write(content)
