export function getBadges(coins, streak){
  const badges = [];

  if(coins >= 20) badges.push("🌱 First Steps");
  if(streak >= 3) badges.push("🔥 Consistent Care");
  if(streak >= 7) badges.push("🌸 One Week Calm");
  if(coins >= 100) badges.push("💎 Zen Explorer");

  return badges;
}
