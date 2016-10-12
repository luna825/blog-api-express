import Logs from '../../model/logs.model'

export function getLogsList(req, res, next){
  const currentPage = parseInt(req.query.currentPage > 0) ? parseInt(req.query.currentPage) : 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage > 0) ? parseInt(req.query.itemsPerPage) : 10;
  const startRow = (currentPage - 1) * itemsPerPage;

  let sortName = String(req.query.sortName) || 'create'
  if (req.query.sortOrder === false){
    sortName = '-' + sortName
  }

  (async function(){

    const count = await Logs.count();
    if (!count) { return res.json({msg: "no logs"}) }

    const logs = await Logs.find().skip(startRow).limit(itemsPerPage).sort(sortName).exec()

    res.json({data:logs, count})
      
  })().catch(err => next(err))


}