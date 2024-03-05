import { type FC, useCallback } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Select from '~/components/general/Select'
import COUNTRIES from '~/../public/libs/countries.json'
import { TextInput } from '~/components/general/Inputs'
import Button from '~/components/general/Button'
import styles from './LocationDataForm.module.scss'

interface LocationDataFormProps {
  onCancel: () => void
}

const LocationDataForm: FC<LocationDataFormProps> = ({ onCancel }) => {
  const form = useFormik({
    initialValues: {
      country: '',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0,
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      country: Yup.string().required('Required!'),
      region: Yup.string().min(2, 'Too Short!').max(100, `Maximum length ${100} characters`),
      city: Yup.string().min(2, 'Too Short!').max(100, `Maximum length ${100} characters`),
      latitude: Yup.number().required('Required!'),
      longitude: Yup.number().required('Required!'),
    }),
    onSubmit: values => console.log(values),
  })

  const handleCountrySelect = useCallback(
    (value: string) => {
      form.setFieldValue('country', value)
    },
    [form],
  )

  return (
    <form onSubmit={form.handleSubmit} className={styles.form}>
      <Select
        label="Country"
        placeholder="Chose country"
        options={Object.values(COUNTRIES)}
        defaultValue={form.initialValues.country}
        onSelect={handleCountrySelect}
        error={form.errors.country}
        className={styles.select}
      />
      <div className={styles.grid}>
        <TextInput
          name="region"
          label="Region"
          placeholder="(optional)"
          value={form.values.region}
          onChange={form.handleChange}
          error={form.errors.region}
          className={styles.input}
        />
        <TextInput
          name="city"
          label="City"
          placeholder="(optional)"
          value={form.values.city}
          onChange={form.handleChange}
          error={form.errors.city}
          className={styles.input}
        />
        <TextInput
          name="latitude"
          label="Latitude"
          placeholder="(optional)"
          value={form.values.latitude}
          onChange={form.handleChange}
          error={form.errors.latitude}
          className={styles.input}
          type="number"
        />
        <TextInput
          name="longitude"
          label="Longitude"
          placeholder="(optional)"
          value={form.values.longitude}
          onChange={form.handleChange}
          error={form.errors.longitude}
          className={styles.input}
          type="number"
        />
      </div>
      <div className={styles.btns}>
        <Button type="button" text="Cancel" variant="text" onClick={onCancel} />
        <Button type="submit" text="Submit" />
      </div>
    </form>
  )
}

export default LocationDataForm
