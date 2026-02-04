-- Allow admins to update fraud logs
CREATE POLICY "Admins can update fraud logs"
  ON public.fraud_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete fraud logs  
CREATE POLICY "Admins can delete fraud logs"
  ON public.fraud_logs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));