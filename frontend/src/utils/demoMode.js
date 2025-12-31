export function simulateStressWeek() {
  const days = ["Mon","Tue","Wed","Thu","Fri"];
  const fake = days.map((d,i)=>({
    mood:"Stressed",
    time:Date.now() - (4-i)*86400000
  }));
  localStorage.setItem("dayHistory", JSON.stringify(fake));
}
