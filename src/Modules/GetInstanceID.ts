const EC2_METADATA_API = 'http://169.254.169.254/latest/meta-data/instance-id';

export const getInstanceId = async (): Promise<string> => {
  const request = await fetch(EC2_METADATA_API);
  if (!request.ok) throw new Error('network error');
  return await request.text();
};
