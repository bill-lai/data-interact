
interface MutualFn<T> { (args: T): boolean }
interface UpdateFn { (): void }

export interface API<T> {
  /**
   * Intercept property change callback，Return false to prevent modification 
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  stop<T>(callback: MutualFn<T>): void;
  stop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * Remove intercepted property change callback
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  removeStop<T>(callback: MutualFn<T>): void;
  removeStop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * One time interception of property change callback,Return false to prevent modification
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  onceStop<T>(callback: MutualFn<T>): void;
  onceStop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  update(callback: UpdateFn): void;
  update(eventName: string, callback: UpdateFn): void;

  /**
   * One time Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  onceUpdate(callback: UpdateFn): void;
  onceUpdate(eventName: string, callback: UpdateFn): void;
  
  /**
   * remove Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  removeUpdate(callback: UpdateFn): void;
  removeUpdate(eventName: string, callback: UpdateFn): void;

  
  /**
   * remove Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  nextTick(callback: UpdateFn): void;
  nextTick(eventName: string, callback: UpdateFn): void;

  // Get the original proxy without attached API
  origin: T,
  // Get the data before modification, which cannot be modified
  old: T,
  
  destroy(): void;
}

export type Interact<T> = T &  { api: API<T> };
export default function exports<T = {}>( options: T ): Interact<T>;