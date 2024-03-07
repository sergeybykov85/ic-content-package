import { type FC, useCallback } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Select from '~/components/general/Select'
import { TextInput } from '~/components/general/Inputs'
import styles from './LocationDataForm.module.scss'
import type { ApplyAdditionalDataParams } from '~/types/bundleDataTypes.ts'
import countries from '~/../public/libs/countries.json'

const COUNTRIES = countries as Record<string, string>

interface LocationDataFormProps {
  formId: string
  onSubmit: (params: Pick<ApplyAdditionalDataParams, 'payload'>) => void
}

interface FormValues {
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
}

const LocationDataForm: FC<LocationDataFormProps> = ({ formId, onSubmit }) => {
  const handleSubmit = useCallback(
    (values: FormValues) => {
      const { country, region, city, latitude, longitude } = values

      const countryCode2 = Object.keys(COUNTRIES).find(key => COUNTRIES[key] === country)!

      onSubmit({
        payload: {
          location: {
            countryCode2,
            region,
            city,
            coordinates: { latitude, longitude },
          },
        },
      })
    },
    [onSubmit],
  )

  const form = useFormik<FormValues>({
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
    onSubmit: handleSubmit,
  })

  const handleCountrySelect = useCallback((value: string) => form.setFieldValue('country', value), [form])

  return (
    <form onSubmit={form.handleSubmit} id={formId} className={styles.form}>
      {/* TODO: Create Select with autocomplete */}
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
    </form>
  )
}

export default LocationDataForm
