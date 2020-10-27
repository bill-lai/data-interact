
interface MutualFn<T> { (args: T): boolean }

interface API<T> {
  /**
   * Intercept property change callback，Return false to prevent modification 
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  listen: (eventName?: string, callback: MutualFn<T>) => {},
  
  /**
   * Remove intercepted property change callback
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  remove: (eventName?: string, callback: MutualFn<T>) => {},
  
  /**
   * One time interception of property change callback,Return false to prevent modification
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  once: (eventName?: string, callback: MutualFn<T>) => {},
  
  /**
   * Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  update: (eventName?: string, callback: MutualFn<T>) => {},

  /**
   * One time Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  onceUpdate: (eventName?: string, callback: MutualFn<T>) => {},
  
  /**
   * remove Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  removeUpdate: (eventName?: string, callback: MutualFn<T>) => {},

  // Get the original proxy without attached API
  origin: T
}


export default interface responsive {
  (args: T): T & { api: API<T> }
}