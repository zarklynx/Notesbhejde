export function studentRankings(notes, stats) {
  const publicIds=new Set(notes.filter(note=>note.visibility!=='private' && note.id).map(note=>note.id))
  const students = new Map()
  for (const note of notes) {
    if (!note.ownerId || note.visibility === 'private') continue
    const row = students.get(note.ownerId) || {id:note.ownerId,notes:0,views:0,favourites:0}
    row.notes++; students.set(row.id,row)
  }
  for (const stat of stats) {
    if(stat.id && !publicIds.has(stat.id)) continue
    const row=students.get(stat.owner)
    if(row) {row.views+=Number(stat.views)||0;row.favourites+=Number(stat.favourites)||0}
  }
  const rows=[...students.values()].filter(row=>row.favourites>0 || row.views>0).map(row=>({...row,points:row.notes*10+row.favourites*5+row.views}))
  for(const row of rows) {
    row.favouritesRank=1+rows.filter(other=>other.favourites>row.favourites).length
    row.viewsRank=1+rows.filter(other=>other.views>row.views).length
    row.averageRank=(row.favouritesRank+row.viewsRank)/2
    row.level=row.points>=500?'Study Champion':row.points>=150?'Campus Mentor':row.points>=50?'Rising Scholar':'Contributor'
  }
  for(const row of rows) row.rank=1+rows.filter(other=>other.averageRank<row.averageRank).length
  return rows.sort((a,b)=>a.averageRank-b.averageRank || a.id.localeCompare(b.id))
}
