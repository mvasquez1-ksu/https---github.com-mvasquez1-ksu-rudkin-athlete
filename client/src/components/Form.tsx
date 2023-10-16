import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";

type Inputs = {
  athleteName: string;
  athleteEmail: string;
  athletePhone: string;
  athleteAddress: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  sport: string;
  package: number;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  highSchool?: string;
  classOf?: string;
  position?: string;
  events?: string;
  yearsPlayed?: string;
  academicAchievements?: string;
  gpa?: string;
  classRank?: string;
  photos?: File[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export default function Form() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const athleteAddress = watch("athleteAddress", "");
  const [matchAthleteAddress, setMatchAthleteAddress] = useState(false);
  const packageLevel = watch("package", 0);
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    axios.get("/products").then((res) => {
      const productArray = Object.keys(res.data).map((key) => ({
        id: key,
        ...res.data[key],
      }));
      setProducts(productArray);
    });
  }, []);
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (page == 0) {
      setPage(1);
    } else {
      console.log(products[packageLevel]);
      axios
        .post("/create-checkout-session", products[data.package])
        .then((res) => {
          console.log(res.data.sessionID);
          if (res.data.checkoutURL) {
            window.open(res.data.checkoutURL);
          }
          if (res.data.sessionID) {
            const formData = new FormData();
            formData.append("sessionID", res.data.sessionID);
            Object.entries(data).forEach(([key, value]) => {
              if (!(value instanceof FileList)) {
                formData.append(key, value.toString());
              }
            });
            if (data.photos) {
              for (let i = 0; i < data.photos.length; i++) {
                formData.append("photos", data.photos[i]);
              }
            }
            axios
              .post("/submit-form", formData)
              .catch((error) => console.log(error));
          } else {
            console.error(
              "Error: unable to obtain checkout session ID. Please try again."
            );
          }
        });
    }
  };

  return (
    <div className="container">
      {page === 0 && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="form-inline"
          encType="multipart/form-data"
        >
          <div className="mb-3">
            <label htmlFor="a_nameInput" className="form-label">
              Athlete Name
            </label>
            <input
              className="form-control"
              id="a_nameInput"
              {...register("athleteName", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_emailInput" className="form-label">
              Email
            </label>
            <input
              className="form-control"
              id="a_emailInput"
              type="email"
              {...register("athleteEmail", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_phoneInput" className="form-label">
              Phone
            </label>
            <input
              className="form-control"
              id="a_phoneInput"
              {...register("athletePhone", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_addressInput" className="form-label">
              Address, City, State, Zip
            </label>
            <input
              className="form-control"
              id="a_addressInput"
              {...register("athleteAddress", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="p_nameInput" className="form-label">
              Parent Name
            </label>
            <input
              className="form-control"
              {...register("parentName", { required: true })}
            />
            {errors.parentName && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_emailInput" className="form-label">
              Parent Email
            </label>
            <input
              className="form-control"
              {...register("parentEmail", { required: true })}
            />
            {errors.parentEmail && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_phoneInput" className="form-label">
              Parent Phone
            </label>
            <input
              className="form-control"
              {...register("parentPhone", { required: true })}
            />
            {errors.parentPhone && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_addressInput" className="form-label">
              Parent Address
            </label>
            <input
              className="form-control"
              disabled={matchAthleteAddress && true}
              {...register("parentAddress", { required: !matchAthleteAddress })}
            />
            {errors.parentAddress && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="btn-group">
            <input
              type="checkbox"
              className="form-check-input"
              id="btncheck1"
              autoComplete="off"
              onChange={(e) => {
                if (e.target.checked) {
                  setValue("parentAddress", athleteAddress);
                  setMatchAthleteAddress(true);
                } else {
                  setValue("parentAddress", "");
                  setMatchAthleteAddress(false);
                }
              }}
            />
            <label className="form-check-label" htmlFor="btncheck1">
              Same as athlete
            </label>
          </div>
          <div className="mb-3">
            <label htmlFor="sportInput" className="form-label">
              Name Your Sport
            </label>
            <input
              className="form-control"
              {...register("sport", { required: true })}
            />
            {errors.sport && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <fieldset className="row mb-3">
            <legend className="col-form-label col-sm-2 pt-0">Package</legend>
            <div className="col-sm-10">
              {products.map((product) => (
                <div className="form-check" key={product.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    {...register("package", { required: true })}
                    id={`gridRadios${product.id}`}
                    value={products.indexOf(product)}
                  />
                  <label className="form-check-label" htmlFor="gridRadios3">
                    {product.description}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}
      {page === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
          <div id="page2Help" className="form-text">
            Only fill in information that you want to be included:
          </div>
          <div className="mb-3">
            <label htmlFor="ageInput" className="form-label">
              Age
            </label>
            <input
              className="form-control"
              id="ageInput"
              {...register("age")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="heightInput" className="form-label">
              Height
            </label>
            <input
              className="form-control"
              id="heightInput"
              {...register("height")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="weightInput" className="form-label">
              Weight
            </label>
            <input
              className="form-control"
              id="weightInput"
              {...register("weight")}
            />
          </div>
          <label htmlFor="genderInput" className="form-label">
            Gender
          </label>
          <select
            className="form-select"
            id="genderInput"
            defaultValue={""}
            {...register("gender")}
          >
            <option value={""}></option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <div className="mb-3">
            <label htmlFor="highSchoolInput" className="form-label">
              High School Name
            </label>
            <input
              className="form-control"
              id="highSchoolInput"
              {...register("highSchool")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classOfInput" className="form-label">
              Class of:
            </label>
            <input
              className="form-control"
              id="classOfInput"
              {...register("classOf")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="positionInput" className="form-label">
              Position
            </label>
            <textarea
              className="form-control"
              id="positionInput"
              {...register("position")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="eventsInput" className="form-label">
              Events
            </label>
            <textarea
              className="form-control"
              id="eventsInput"
              {...register("events")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="yearsPlayedInput" className="form-label">
              Years Played
            </label>
            <input
              className="form-control"
              id="yearsPlayedInput"
              {...register("yearsPlayed")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="academicAchievementsInput" className="form-label">
              Academic Achievements
            </label>
            <textarea
              className="form-control"
              id="academicAchievementsInput"
              {...register("academicAchievements")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="gpaInput" className="form-label">
              GPA
            </label>
            <input
              className="form-control"
              id="gpaInput"
              {...register("gpa")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classRankInput" className="form-label">
              Class Rank
            </label>
            <input
              className="form-control"
              id="classRankInput"
              {...register("classRank")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="photoUploadInput" className="form-label">
              Upload photos:
            </label>
            <div id="photoUploadHelp" className="form-text">
              Up to {packageLevel == 1 ? "5" : "15"} photos can be uploaded.
            </div>
            <input
              className="form-control"
              type="file"
              id="photoUploadInput"
              accept="image/*"
              multiple
              {...register("photos")}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Pay Now
          </button>
        </form>
      )}
    </div>
  );
}
