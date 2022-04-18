import {
  faChevronLeft,
  faChevronRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { getPopularTv, getTopRatedTv, getTv, IGetTvResult } from "../api";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 15px;
  width: 50%;
  display: flex;
  flex-direction: column;
  span {
    font-size: 20px;
  }
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
  display: flex;
  justify-content: space-between;
`;

const SliderTitle = styled.h1`
  position: absolute;
  font-size: 30px;
  margin-left: 15px;
  top: -50px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  position: relative;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 15px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigTv = styled(motion.div)`
  position: absolute;
  width: 30vw;
  height: 60vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 45%;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 30px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  top: -80px;
  font-size: 15px;
`;

const BigDetail = styled.div`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  top: -100px;
  font-size: 20px;
`;

const rowVars = {
  hidden: (leaving: boolean) => ({
    x: leaving ? -window.outerWidth + 6 : window.outerWidth - 6,
  }),
  visible: {
    x: 0,
  },
  exit: (leaving: boolean) => ({
    x: leaving ? window.outerWidth - 6 : -window.outerWidth + 6,
  }),
};

const boxVars = {
  normal: {
    scale: 1,
  },
  hover: {
    zIndex: 98,
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.4,
      type: "tween",
    },
  },
};

const infoVars = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

function Tv() {
  const history = useHistory();
  const BigTvMatch = useRouteMatch<{ tvId: string }>("/tv/airing_today/:tvId");
  const bigPopularMatch = useRouteMatch<{ tvId: string }>("/tv/popular/:tvId");
  const bigRatedMatch = useRouteMatch<{ tvId: string }>("/tv/top_rated/:tvId");
  const { scrollY } = useViewportScroll();
  const { data: data, isLoading } = useQuery<IGetTvResult>(
    ["tv", "airingToday"],
    getTv
  );
  const { data: popularData } = useQuery<IGetTvResult>(
    ["tv", "popular"],
    getPopularTv
  );
  const { data: ratedData } = useQuery<IGetTvResult>(
    ["tv", "topRated"],
    getTopRatedTv
  );
  const [index, setIndex] = useState(0);
  const [pIndex, setPIndex] = useState(0);
  const [trIndex, setTRIndex] = useState(0);
  const [back, setBack] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalTv = data?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalTv = data?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const popularIncreaseIndex = () => {
    if (popularData) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalTv = popularData?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setPIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const popularDecreaseIndex = () => {
    if (popularData) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalTv = popularData?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setPIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const topRatedIncreaseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalTv = ratedData?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setTRIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const topRatedDecreaseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalTv = ratedData?.results.length;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      setTRIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const onBoxClicked = (tvId: number) => {
    history.push(`/tv/airing_today/${tvId}`);
  };
  const onPopularBoxClicked = (tvId: number) => {
    history.push(`/tv/popular/${tvId}`);
  };
  const onTopRatedBoxClicked = (tvId: number) => {
    history.push(`/tv/top_rated/${tvId}`);
  };
  const onOverlayClicked = () => history.push("/tv");
  const clickedTv =
    BigTvMatch?.params.tvId &&
    data?.results.find((tv) => String(tv.id) === BigTvMatch?.params.tvId);
  const clickedPopularTv =
    bigPopularMatch?.params.tvId &&
    popularData?.results.find(
      (tv) => String(tv.id) === bigPopularMatch?.params.tvId
    );
  const clickedTopRatedTv =
    bigRatedMatch?.params.tvId &&
    ratedData?.results.find(
      (tv) => String(tv.id) === bigRatedMatch?.params.tvId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}>
            <Title>{data?.results[0].name}</Title>
            <Overview>
              <span style={{ fontSize: "15px", paddingBottom: "15px" }}>
                {data?.results[0].overview}
              </span>
              <span>Release date: {data?.results[0].first_air_date}</span>
              <span>
                Score:
                <FontAwesomeIcon
                  icon={faStar}
                  style={{
                    color: "gold",
                    fontSize: "20px",
                    paddingLeft: "3px",
                    paddingRight: "5px",
                  }}
                />
                {data?.results[0].vote_average}
              </span>
              <span>Vote count: {data?.results[0].vote_count}</span>
            </Overview>
          </Banner>
          <Slider>
            <SliderTitle>Airing Today</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={decreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={index}
                custom={back}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      key={tv.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={increaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <Slider style={{ top: "0px" }}>
            <SliderTitle>Popular</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={popularDecreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={pIndex}
                custom={back}
              >
                {popularData?.results
                  .slice(1)
                  .slice(offset * pIndex, offset * pIndex + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      key={tv.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onPopularBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={popularIncreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <Slider style={{ top: "100px" }}>
            <SliderTitle>Top Rated</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={topRatedDecreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={trIndex}
                custom={back}
              >
                {ratedData?.results
                  .slice(1)
                  .slice(offset * trIndex, offset * trIndex + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      key={tv.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onTopRatedBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={topRatedIncreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <AnimatePresence>
            {BigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  layoutId={BigTvMatch.params.tvId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                      <BigDetail>
                        <span>First air date: {clickedTv.first_air_date}</span>
                        <span>
                          Score:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedTv.vote_average}
                        </span>
                        <span>Vote count: {clickedTv.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
            {bigPopularMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  layoutId={bigPopularMatch.params.tvId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedPopularTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedPopularTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedPopularTv.name}</BigTitle>
                      <BigOverview>{clickedPopularTv.overview}</BigOverview>
                      <BigDetail>
                        <span>
                          First air date: {clickedPopularTv.first_air_date}
                        </span>
                        <span>
                          Score:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedPopularTv.vote_average}
                        </span>
                        <span>Vote count: {clickedPopularTv.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
            {bigRatedMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  layoutId={bigRatedMatch.params.tvId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedTopRatedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedTopRatedTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTopRatedTv.name}</BigTitle>
                      <BigOverview>{clickedTopRatedTv.overview}</BigOverview>
                      <BigDetail>
                        <span>
                          First air date: {clickedTopRatedTv.first_air_date}
                        </span>
                        <span>
                          Score:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedTopRatedTv.vote_average}
                        </span>
                        <span>Vote count: {clickedTopRatedTv.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
