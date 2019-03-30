module.exports = {
  /**
   * Enable this to make ids coerce to either 1 or 2.
   * This is handy for when you want to check if a select
   * box is filling based on config information passed down.
   *
   * But it's less handy if you need every id on a page to be unique,
   * which is true for most cases. By default, this should be false
   */
  useSequentialIds: false,
};
