export default {
  
  /**
   * 判断两条线段是否相交
   * @param {*} line1 
   * @param {*} line2 
   */
  isLineIntersect: (line1, line2) => {
    var a1 = line1.points[1].y - line1.points[0].y;
    var b1 = line1.points[0].x - line1.points[1].x;
    var c1 = a1 * line1.points[0].x + b1 * line1.points[0].y;
    //转换成一般式: Ax+By = C
    var a2 = line2.points[1].y - line2.points[0].y;
    var b2 = line2.points[0].x - line2.points[1].x;
    var c2 = a2 * line2.points[0].x + b2 * line2.points[0].y;
    // 计算交点		
    var d = a1 * b2 - a2 * b1;

    // 当d==0时，两线平行
    if (d == 0) {
      return false;
    } else {
      var x = (b2 * c1 - b1 * c2) / d;
      var y = (a1 * c2 - a2 * c1) / d;

      // 检测交点是否在两条线段上
      if ((isInBetween(line1.points[0].x, x, line1.points[1].x) || isInBetween(line1.points[0].y, y, line1.points[1].y)) &&
        (isInBetween(line2.points[0].x, x, line2.points[1].x) || isInBetween(line2.points[0].y, y, line2.points[1].y))) {
        return true;
      }
    }

    function isInBetween(a, b, c) {
      // 如果b几乎等于a或c，返回false.为了避免浮点运行时两值几乎相等，但存在相差0.00000...0001的这种情况出现使用下面方式进行避免

      if (Math.abs(a - b) < 0.000001 || Math.abs(b - c) < 0.000001) {
        return false;
      }

      return (a <= b && b <= c) || (c <= b && b <= a);
    }

    return false;
  }

}